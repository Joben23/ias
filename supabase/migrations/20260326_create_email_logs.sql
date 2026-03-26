-- Create email_logs table to track all email sends
CREATE TABLE public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  template_type text NOT NULL DEFAULT 'interview_invitation', -- interview_invitation, interview_reminder, etc.
  status text NOT NULL DEFAULT 'pending', -- pending, sent, failed, bounced
  resend_id text, -- ID from Resend API for tracking
  error_message text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view email logs for their interviews
CREATE POLICY "Authenticated can view email logs"
  ON public.email_logs FOR SELECT TO authenticated
  USING (true);

-- HR and Admin can manage email logs
CREATE POLICY "HR and Admin can manage email logs"
  ON public.email_logs FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

-- Create indexes for better performance
CREATE INDEX idx_email_logs_interview_id ON public.email_logs(interview_id);
CREATE INDEX idx_email_logs_applicant_id ON public.email_logs(applicant_id);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);
CREATE INDEX idx_email_logs_created_at ON public.email_logs(created_at DESC);
CREATE INDEX idx_email_logs_recipient_email ON public.email_logs(recipient_email);

-- Add resend_id column to interviews table to track which email was sent
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS email_sent boolean DEFAULT false;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS email_sent_at timestamptz;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS last_email_resend_id text;
