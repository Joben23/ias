-- Add password_hash column to profiles table for email+password authentication
ALTER TABLE "public"."profiles" 
ADD COLUMN "password_hash" TEXT DEFAULT NULL;

-- Update existing profiles with temporary passwords for testing
-- WARNING: These are demo passwords only. Replace with actual user passwords in production.
UPDATE "public"."profiles" 
SET "password_hash" = CASE 
  WHEN email = 'justinesquita21@gmail.com' THEN 'test123'
  WHEN email = 'admin@medhire.local' THEN 'admin123'
  WHEN email = 'justinesquita0007@gmail.com' THEN 'test123'
  WHEN email = 'sionbenjo@gmail.com' THEN 'test123'
  WHEN email = 'justin.esquita@medhire.local' THEN 'test123'
  WHEN email = 'shinyuna0269@gmail.com' THEN 'test123'
  ELSE 'test123'
END 
WHERE email IS NOT NULL;

-- Add index for password lookups
CREATE INDEX IF NOT EXISTS "profiles_password_hash_idx" ON "public"."profiles" USING BTREE ("password_hash");
