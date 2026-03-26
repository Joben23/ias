/**
 * Email Notification System Types
 * TypeScript definitions for email logs and interview tracking
 */

/**
 * Email template types
 */
export type EmailTemplateType = 
  | 'interview_invitation' 
  | 'interview_reminder' 
  | 'rejection_notification'
  | 'offer_letter'
  | 'followup';

/**
 * Email send status
 */
export type EmailStatus = 
  | 'pending'      // Waiting to be sent
  | 'sent'         // Successfully sent
  | 'failed'       // Failed to send
  | 'bounced'      // Email bounced back
  | 'opened'       // Recipient opened email
  | 'clicked';     // Recipient clicked link

/**
 * Email log record from database
 */
export interface EmailLog {
  id: string;
  interview_id: string;
  applicant_id: string;
  recipient_email: string;
  subject: string;
  template_type: EmailTemplateType;
  status: EmailStatus;
  resend_id: string | null;        // Resend API ID for tracking
  error_message: string | null;
  sent_at: string | null;          // ISO timestamp
  created_at: string;              // ISO timestamp
  updated_at: string;              // ISO timestamp
}

/**
 * Interview with email tracking information
 */
export interface InterviewWithEmailStatus {
  id: string;
  applicant_id: string;
  job_posting_id: string | null;
  interview_date: string;
  interview_time: string;
  interview_type: 'On-site' | 'Online';
  location: string | null;
  meeting_link: string | null;
  panel_members: string[];
  notes: string | null;
  status: string;
  // Email tracking fields
  email_sent: boolean;
  email_sent_at: string | null;
  last_email_resend_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Request body for send-interview-notification edge function
 */
export interface SendInterviewNotificationRequest {
  interview_id: string;
}

/**
 * Response from send-interview-notification edge function
 */
export interface SendInterviewNotificationResponse {
  message: string;
  resend_id?: string;
  warning?: string;
  error?: string;
}

/**
 * Email send result from edge function
 */
export interface EmailSendResult {
  success: boolean;
  resend_id?: string;
  message: string;
  error?: string;
  status: EmailStatus;
}

/**
 * Applicant with email for interview scheduling
 */
export interface ApplicantForInterview {
  id: string;
  full_name: string;
  email: string;
  position_applied: string;
  phone: string | null;
  status: string;
}

/**
 * Query result for email logs with applicant details
 */
export interface EmailLogWithApplicant extends EmailLog {
  applicant?: {
    id: string;
    full_name: string;
    position_applied: string;
    email: string;
  };
  interview?: {
    interview_date: string;
    interview_time: string;
    interview_type: string;
  };
}

/**
 * Email statistics for dashboard
 */
export interface EmailStatistics {
  total_sent: number;
  total_failed: number;
  total_pending: number;
  success_rate: number;
  last_24_hours: number;
  last_7_days: number;
}

/**
 * Resend API response
 * @see https://resend.com/docs/api-reference/emails/send
 */
export interface ResendEmailResponse {
  id: string;
  from: string;
  to: string[];
  created_at: string;
  subject: string;
}

/**
 * Helper function to format email log status for display
 */
export function formatEmailStatus(status: EmailStatus): {
  label: string;
  color: 'success' | 'error' | 'warning' | 'pending' | 'info';
  icon: string;
} {
  const statusMap: Record<EmailStatus, any> = {
    'pending': { label: 'Pending', color: 'pending', icon: '⏳' },
    'sent': { label: 'Sent', color: 'success', icon: '✓' },
    'failed': { label: 'Failed', color: 'error', icon: '✗' },
    'bounced': { label: 'Bounced', color: 'error', icon: '⛔' },
    'opened': { label: 'Opened', color: 'info', icon: '👁️' },
    'clicked': { label: 'Clicked', color: 'success', icon: '🔗' },
  };
  return statusMap[status] || { label: 'Unknown', color: 'warning', icon: '?' };
}

/**
 * Helper to check if email send was successful
 */
export function isEmailSent(log: EmailLog | null): boolean {
  return log?.status === 'sent' || log?.status === 'opened' || log?.status === 'clicked';
}

/**
 * Helper to check if email has failed and needs retry
 */
export function shouldRetryEmail(log: EmailLog): boolean {
  return log.status === 'failed' && (!log.error_message?.includes('Invalid email'));
}
