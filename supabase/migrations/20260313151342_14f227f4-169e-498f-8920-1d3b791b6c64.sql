
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  related_applicant_id uuid REFERENCES public.applicants(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all notifications
CREATE POLICY "Authenticated can view notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated can update (mark as read)
CREATE POLICY "Authenticated can update notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow inserts from triggers (service role) and authenticated
CREATE POLICY "Allow insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow anon inserts (for public career portal applicant trigger)
CREATE POLICY "Anon can insert notifications"
  ON public.notifications FOR INSERT
  TO anon
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger: new applicant submitted
CREATE OR REPLACE FUNCTION public.notify_new_applicant()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (title, message, related_applicant_id)
  VALUES (
    'New Applicant',
    'New applicant: ' || NEW.full_name || ' applied for ' || NEW.position_applied,
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_applicant
  AFTER INSERT ON public.applicants
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_applicant();

-- Trigger: interview scheduled
CREATE OR REPLACE FUNCTION public.notify_interview_scheduled()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  applicant_name text;
  applicant_position text;
BEGIN
  SELECT full_name, position_applied INTO applicant_name, applicant_position
  FROM public.applicants WHERE id = NEW.applicant_id;

  INSERT INTO public.notifications (title, message, related_applicant_id)
  VALUES (
    'Interview Scheduled',
    'Interview scheduled with ' || COALESCE(applicant_name, 'Unknown') || ' for ' || COALESCE(applicant_position, 'Unknown'),
    NEW.applicant_id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_interview_scheduled
  AFTER INSERT ON public.interviews
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_interview_scheduled();

-- Trigger: job offer accepted
CREATE OR REPLACE FUNCTION public.notify_offer_accepted()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'Offer Accepted' AND (OLD.status IS DISTINCT FROM 'Offer Accepted') THEN
    INSERT INTO public.notifications (title, message, related_applicant_id)
    VALUES (
      'Offer Accepted',
      'Job offer accepted by ' || NEW.candidate_name,
      NEW.applicant_id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_offer_accepted
  AFTER UPDATE ON public.job_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_offer_accepted();
