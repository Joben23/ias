-- Create a stored procedure for hiring applicants
-- This bypasses edge functions and uses PostgreSQL directly

CREATE OR REPLACE FUNCTION hire_applicant(
  p_applicant_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_applicant RECORD;
  v_user_id UUID;
  v_employee_id TEXT;
  v_password TEXT;
  v_start_date DATE;
  v_result JSON;
BEGIN
  -- 1. Get applicant
  SELECT * INTO v_applicant FROM applicants WHERE id = p_applicant_id;
  
  IF v_applicant IS NULL THEN
    RETURN JSON_BUILD_OBJECT('error', 'Applicant not found', 'success', FALSE);
  END IF;
  
  -- 2. Check if already hired
  IF v_applicant.status = 'Hired' THEN
    RETURN JSON_BUILD_OBJECT('error', 'Already hired', 'success', FALSE);
  END IF;
  
  -- 3. Generation credentials
  v_password := 'MedHire' || SUBSTR(MD5(RANDOM()::TEXT), 1, 8) || '!';
  v_employee_id := 'EMP-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || SUBSTR(MD5(RANDOM()::TEXT), 1, 4);
  v_start_date := COALESCE((
    SELECT start_date FROM job_offers 
    WHERE applicant_id = p_applicant_id 
    ORDER BY created_at DESC 
    LIMIT 1
  ), CURRENT_DATE);
  
  -- 4. Create auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    last_sign_in_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    v_applicant.email,
    crypt(v_password, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"' || v_applicant.full_name || '","department":"' || COALESCE(v_applicant.department, '') || '","position":"' || COALESCE(v_applicant.position_applied, '') || '"}',
    NOW(),
    NOW(),
    NULL,
    '',
    '',
    '',
    ''
  ) RETURNING id INTO v_user_id;
  
  -- 5. Create employee record
  INSERT INTO employees (
    user_id,
    applicant_id,
    employee_id,
    full_name,
    email,
    phone,
    position,
    department,
    start_date,
    status,
    onboarding_status
  ) VALUES (
    v_user_id,
    p_applicant_id,
    v_employee_id,
    v_applicant.full_name,
    v_applicant.email,
    COALESCE(v_applicant.phone, ''),
    v_applicant.position_applied,
    COALESCE(v_applicant.department, ''),
    v_start_date,
    'Active',
    'Pending'
  );
  
  -- 6. Create profile
  INSERT INTO profiles (id, full_name, email, phone, department, role)
  VALUES (v_user_id, v_applicant.full_name, v_applicant.email, COALESCE(v_applicant.phone, ''), COALESCE(v_applicant.department, ''), 'employee')
  ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = 'employee';
  
  -- 7. Assign role
  INSERT INTO user_roles (user_id, role)
  VALUES (v_user_id, 'employee')
  ON CONFLICT DO NOTHING;
  
  -- 8. Update applicant to Hired
  UPDATE applicants SET status = 'Hired' WHERE id = p_applicant_id;
  
  -- 9. Return success
  RETURN JSON_BUILD_OBJECT(
    'success', TRUE,
    'employee_id', v_employee_id,
    'user_id', v_user_id,
    'username', LOWER(REPLACE(v_applicant.full_name, ' ', '.')),
    'password', v_password,
    'email', v_applicant.email,
    'start_date', v_start_date::TEXT
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN JSON_BUILD_OBJECT(
    'error', SQLERRM,
    'success', FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION hire_applicant(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION hire_applicant(UUID) TO anon;
