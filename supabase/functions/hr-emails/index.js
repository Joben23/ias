import { sendEmail } from '../../services/email/sendEmail.js';
import { interviewTemplate } from '../../services/email/templates/interview.js';
import { jobOfferTemplate } from '../../services/email/templates/jobOffer.js';

export async function sendInterviewEmail(applicant) {
  const html = interviewTemplate(applicant.name, applicant.date);

  await sendEmail(
    applicant.email,
    'Interview Scheduled',
    html
  );
}

export async function sendJobOfferEmail(applicant) {
  const html = jobOfferTemplate(applicant.name);

  await sendEmail(
    applicant.email,
    'Job Offer',
    html
  );
}