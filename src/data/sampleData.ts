export type ApplicantStatus = 'Applied' | 'Under Screening' | 'Shortlisted' | 'Interview Scheduled' | 'Selected' | 'Offer Sent' | 'Offer Accepted' | 'Offer Declined' | 'Hired' | 'Rejected';

export type Department = 'Emergency' | 'Surgery' | 'Pediatrics' | 'Cardiology' | 'Pharmacy' | 'Administration' | 'Security' | 'Maintenance' | 'ICU' | 'Radiology';

export type Position = 'Doctor' | 'Nurse' | 'Medical Technologist' | 'Pharmacist' | 'Administrative Staff' | 'Security Personnel' | 'Maintenance Staff';

export interface Applicant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  education: string;
  certifications: string[];
  positionApplied: Position;
  department: Department;
  applicationDate: string;
  status: ApplicantStatus;
  experience: string;
  avatar?: string;
  resumeFile?: string;
  rating?: number;
}

export interface JobPosting {
  id: string;
  title: string;
  department: Department;
  position: Position;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract';
  description: string;
  requirements: string[];
  applicantCount: number;
  postedDate: string;
  closingDate: string;
  status: 'Open' | 'Closed' | 'On Hold';
}

export interface NewHire {
  id: string;
  name: string;
  position: Position;
  department: Department;
  startDate: string;
  onboardingStep: 'Offer Sent' | 'Offer Accepted' | 'Documents Submitted' | 'Orientation' | 'Employee Activated';
  completedTasks: number;
  totalTasks: number;
  avatar?: string;
}

export interface PerformanceReview {
  id: string;
  employeeName: string;
  position: Position;
  department: Department;
  reviewType: '30-Day' | '60-Day' | '90-Day';
  workPerformance: number;
  skillsAssessment: number;
  behaviorEvaluation: number;
  overallRating: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  reviewer: string;
}

export interface Recognition {
  id: string;
  employeeName: string;
  position: Position;
  department: Department;
  awardType: string;
  description: string;
  date: string;
  likes: number;
  comments: number;
  avatar?: string;
}

const initials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

export const applicants: Applicant[] = [
  {
    id: 'APP-001',
    fullName: 'Lebron James',
    email: 'lebron.james@mail.com',
    phone: '+1-555-0101',
    education: 'MD - Harvard Medical School',
    certifications: ['Board Certified Cardiologist', 'ACLS'],
    positionApplied: 'Doctor',
    department: 'Cardiology',
    applicationDate: '2026-02-15',
    status: 'Interview Scheduled',
    experience: '8 years',
    rating: 4.5,
  },
  {
    id: 'APP-002',
    fullName: 'Tung Tung Tung Sahur',
    email: 'tungtung@mail.com',
    phone: '+1-555-0102',
    education: 'BSN - University of the Philippines',
    certifications: ['RN License', 'BLS'],
    positionApplied: 'Nurse',
    department: 'Emergency',
    applicationDate: '2026-02-18',
    status: 'Shortlisted',
    experience: '5 years',
    rating: 4.2,
  },
  {
    id: 'APP-003',
    fullName: 'Mr. Long Bomb',
    email: 'longbomb@mail.com',
    phone: '+1-555-0103',
    education: 'BS Medical Technology - MIT',
    certifications: ['ASCP Certified', 'Phlebotomy'],
    positionApplied: 'Medical Technologist',
    department: 'Radiology',
    applicationDate: '2026-02-20',
    status: 'Under Screening',
    experience: '3 years',
    rating: 3.8,
  },
  {
    id: 'APP-004',
    fullName: 'Halimaw Magmahal',
    email: 'halimaw@mail.com',
    phone: '+1-555-0104',
    education: 'PharmD - Johns Hopkins',
    certifications: ['Licensed Pharmacist', 'MTM Certified'],
    positionApplied: 'Pharmacist',
    department: 'Pharmacy',
    applicationDate: '2026-02-22',
    status: 'Selected',
    experience: '6 years',
    rating: 4.8,
  },
  {
    id: 'APP-005',
    fullName: 'Uncle Drew',
    email: 'uncledrew@mail.com',
    phone: '+1-555-0105',
    education: 'BA Business Administration',
    certifications: ['PMP', 'Healthcare Admin Cert'],
    positionApplied: 'Administrative Staff',
    department: 'Administration',
    applicationDate: '2026-02-25',
    status: 'Applied',
    experience: '4 years',
  },
  {
    id: 'APP-006',
    fullName: 'Stephen Curry',
    email: 'steph.curry@mail.com',
    phone: '+1-555-0106',
    education: 'MD - Stanford University',
    certifications: ['Board Certified Surgeon', 'ATLS'],
    positionApplied: 'Doctor',
    department: 'Surgery',
    applicationDate: '2026-02-28',
    status: 'Interview Scheduled',
    experience: '12 years',
    rating: 4.9,
  },
  {
    id: 'APP-007',
    fullName: 'Mama Coco',
    email: 'mamacoco@mail.com',
    phone: '+1-555-0107',
    education: 'BSN - NYU',
    certifications: ['RN License', 'PALS', 'NRP'],
    positionApplied: 'Nurse',
    department: 'Pediatrics',
    applicationDate: '2026-03-01',
    status: 'Hired',
    experience: '7 years',
    rating: 4.6,
  },
  {
    id: 'APP-008',
    fullName: 'Rasc Binuya',
    email: 'rasc.b@mail.com',
    phone: '+1-555-0108',
    education: 'Criminal Justice Degree',
    certifications: ['Hospital Security Cert', 'First Aid'],
    positionApplied: 'Security Personnel',
    department: 'Security',
    applicationDate: '2026-03-02',
    status: 'Under Screening',
    experience: '2 years',
  },
  {
    id: 'APP-009',
    fullName: 'Six Seven',
    email: 'sixseven@mail.com',
    phone: '+1-555-0109',
    education: 'Vocational - HVAC & Electrical',
    certifications: ['HVAC Cert', 'Electrical Safety'],
    positionApplied: 'Maintenance Staff',
    department: 'Maintenance',
    applicationDate: '2026-03-03',
    status: 'Applied',
    experience: '5 years',
  },
  {
    id: 'APP-010',
    fullName: 'Low Cortisol',
    email: 'lowcortisol@mail.com',
    phone: '+1-555-0110',
    education: 'BSN - UCLA',
    certifications: ['RN License', 'CCRN'],
    positionApplied: 'Nurse',
    department: 'ICU',
    applicationDate: '2026-03-04',
    status: 'Shortlisted',
    experience: '4 years',
    rating: 4.0,
  },
  {
    id: 'APP-011',
    fullName: 'High Cortisol',
    email: 'highcortisol@mail.com',
    phone: '+1-555-0111',
    education: 'MD - Yale',
    certifications: ['Board Certified Emergency Med'],
    positionApplied: 'Doctor',
    department: 'Emergency',
    applicationDate: '2026-03-05',
    status: 'Applied',
    experience: '3 years',
  },
  {
    id: 'APP-012',
    fullName: 'Bronny James',
    email: 'bronny@mail.com',
    phone: '+1-555-0112',
    education: 'BS Pharmacy - Duke',
    certifications: ['PharmD Intern'],
    positionApplied: 'Pharmacist',
    department: 'Pharmacy',
    applicationDate: '2026-03-06',
    status: 'Rejected',
    experience: '1 year',
    rating: 2.5,
  },
];

export const jobPostings: JobPosting[] = [
  {
    id: 'JOB-001',
    title: 'Senior Cardiologist',
    department: 'Cardiology',
    position: 'Doctor',
    employmentType: 'Full-Time',
    description: 'Lead cardiology department clinical operations and patient care.',
    requirements: ['MD degree', '5+ years cardiology', 'Board certified', 'ACLS'],
    applicantCount: 8,
    postedDate: '2026-02-01',
    closingDate: '2026-04-01',
    status: 'Open',
  },
  {
    id: 'JOB-002',
    title: 'Emergency Room Nurse',
    department: 'Emergency',
    position: 'Nurse',
    employmentType: 'Full-Time',
    description: 'Provide critical care in high-pressure emergency situations.',
    requirements: ['BSN', 'RN License', 'BLS/ACLS', '2+ years ER experience'],
    applicantCount: 15,
    postedDate: '2026-02-10',
    closingDate: '2026-03-30',
    status: 'Open',
  },
  {
    id: 'JOB-003',
    title: 'Chief Pharmacist',
    department: 'Pharmacy',
    position: 'Pharmacist',
    employmentType: 'Full-Time',
    description: 'Oversee pharmacy operations and medication management.',
    requirements: ['PharmD', 'Licensed', '7+ years experience', 'Leadership skills'],
    applicantCount: 4,
    postedDate: '2026-02-15',
    closingDate: '2026-03-25',
    status: 'Open',
  },
  {
    id: 'JOB-004',
    title: 'Pediatric Nurse',
    department: 'Pediatrics',
    position: 'Nurse',
    employmentType: 'Part-Time',
    description: 'Specialized nursing care for pediatric patients.',
    requirements: ['BSN', 'RN License', 'PALS', 'Pediatric experience'],
    applicantCount: 6,
    postedDate: '2026-01-20',
    closingDate: '2026-03-01',
    status: 'Closed',
  },
  {
    id: 'JOB-005',
    title: 'Hospital Security Officer',
    department: 'Security',
    position: 'Security Personnel',
    employmentType: 'Full-Time',
    description: 'Maintain safety and security across hospital premises.',
    requirements: ['Security training', 'First Aid cert', 'Clean record'],
    applicantCount: 3,
    postedDate: '2026-03-01',
    closingDate: '2026-04-15',
    status: 'Open',
  },
];

export const newHires: NewHire[] = [
  {
    id: 'NH-001',
    name: 'Mama Coco',
    position: 'Nurse',
    department: 'Pediatrics',
    startDate: '2026-03-10',
    onboardingStep: 'Orientation',
    completedTasks: 8,
    totalTasks: 12,
  },
  {
    id: 'NH-002',
    name: 'Michael Jordan',
    position: 'Doctor',
    department: 'Surgery',
    startDate: '2026-03-15',
    onboardingStep: 'Documents Submitted',
    completedTasks: 5,
    totalTasks: 12,
  },
  {
    id: 'NH-003',
    name: 'Halimaw Magmahal',
    position: 'Pharmacist',
    department: 'Pharmacy',
    startDate: '2026-03-20',
    onboardingStep: 'Offer Accepted',
    completedTasks: 2,
    totalTasks: 12,
  },
];

export const performanceReviews: PerformanceReview[] = [
  {
    id: 'PR-001',
    employeeName: 'Mama Coco',
    position: 'Nurse',
    department: 'Pediatrics',
    reviewType: '30-Day',
    workPerformance: 88,
    skillsAssessment: 92,
    behaviorEvaluation: 95,
    overallRating: 91,
    status: 'Completed',
    reviewer: 'Dr. Lebron James',
  },
  {
    id: 'PR-002',
    employeeName: 'Michael Jordan',
    position: 'Doctor',
    department: 'Surgery',
    reviewType: '30-Day',
    workPerformance: 95,
    skillsAssessment: 97,
    behaviorEvaluation: 90,
    overallRating: 94,
    status: 'In Progress',
    reviewer: 'Dr. Stephen Curry',
  },
  {
    id: 'PR-003',
    employeeName: 'Uncle Drew',
    position: 'Administrative Staff',
    department: 'Administration',
    reviewType: '60-Day',
    workPerformance: 78,
    skillsAssessment: 80,
    behaviorEvaluation: 85,
    overallRating: 81,
    status: 'Pending',
    reviewer: 'Mr. Long Bomb',
  },
];

export const recognitions: Recognition[] = [
  {
    id: 'REC-001',
    employeeName: 'Mama Coco',
    position: 'Nurse',
    department: 'Pediatrics',
    awardType: 'Employee of the Month',
    description: 'Outstanding dedication to pediatric patient care. Went above and beyond during the flu season surge, staying extra shifts and maintaining exceptional patient satisfaction scores.',
    date: '2026-03-01',
    likes: 47,
    comments: 12,
  },
  {
    id: 'REC-002',
    employeeName: 'Stephen Curry',
    position: 'Doctor',
    department: 'Surgery',
    awardType: 'Outstanding Physician Award',
    description: 'Successfully performed 3 complex surgeries this month with zero complications. A true inspiration to the surgical team.',
    date: '2026-02-28',
    likes: 63,
    comments: 18,
  },
  {
    id: 'REC-003',
    employeeName: 'Rasc Binuya',
    position: 'Security Personnel',
    department: 'Security',
    awardType: 'Best Support Staff',
    description: 'Prevented a security incident with quick thinking and professionalism. Always goes the extra mile to ensure patient and staff safety.',
    date: '2026-02-25',
    likes: 34,
    comments: 8,
  },
  {
    id: 'REC-004',
    employeeName: 'Tung Tung Tung Sahur',
    position: 'Nurse',
    department: 'Emergency',
    awardType: 'Peer Recognition',
    description: 'Nominated by 5 colleagues for being the most helpful and supportive team member in the ER. Always brings positive energy!',
    date: '2026-02-20',
    likes: 52,
    comments: 15,
  },
];

export const pipelineStats = {
  applied: applicants.filter(a => a.status === 'Applied').length,
  screening: applicants.filter(a => a.status === 'Under Screening').length,
  shortlisted: applicants.filter(a => a.status === 'Shortlisted').length,
  interview: applicants.filter(a => a.status === 'Interview Scheduled').length,
  selected: applicants.filter(a => a.status === 'Selected').length,
  offerSent: applicants.filter(a => a.status === 'Offer Sent').length,
  offerAccepted: applicants.filter(a => a.status === 'Offer Accepted').length,
  hired: applicants.filter(a => a.status === 'Hired').length,
  rejected: applicants.filter(a => a.status === 'Rejected').length,
};

export const dashboardStats = {
  totalApplicants: applicants.length,
  activeJobOpenings: jobPostings.filter(j => j.status === 'Open').length,
  candidatesInInterview: applicants.filter(a => a.status === 'Interview Scheduled').length,
  newHiresThisMonth: newHires.length,
  employeesUnderProbation: performanceReviews.filter(p => p.status !== 'Completed').length,
  recognitionHighlights: recognitions.length,
};
