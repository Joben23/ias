import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { HeartPulse, ArrowLeft, Upload, CheckCircle2, Briefcase, Building2, MapPin, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface JobDetail {
  id: string;
  title: string;
  department: string;
  position: string;
  employment_type: string;
  description: string;
  requirements: string[] | null;
  location: string | null;
  closing_date: string | null;
}

export default function JobApplicationPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      const { data } = await supabase
        .from('job_postings')
        .select('id, title, department, position, employment_type, description, requirements, location, closing_date')
        .eq('id', jobId)
        .single();
      if (data) setJob(data as JobDetail);
      setLoading(false);
    };
    fetchJob();
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !fullName || !email) return;
    setSubmitting(true);

    let resumePath: string | null = null;

    // Upload resume if provided
    if (resumeFile) {
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${fullName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resumeFile);
      if (!uploadError) {
        resumePath = fileName;
      }
    }

    // Insert applicant
    const { error } = await supabase.from('applicants').insert({
      full_name: fullName,
      email: email,
      phone: phone || null,
      position_applied: job.position,
      department: job.department,
      experience: experience || null,
      resume_file: resumePath,
      cover_letter: coverLetter || null,
      skills: skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : null,
      job_posting_id: job.id,
      status: 'Applied',
    } as any);

    setSubmitting(false);

    if (error) {
      toast({ title: 'Submission failed', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } else {
      setSubmitted(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="gradient-primary w-12 h-12 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">Job posting not found.</p>
        <Link to="/" className="text-primary text-sm hover:underline">← Back to Home</Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-elevated p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Application Submitted Successfully!</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Thank you for applying. Our HR team will review your application and contact you soon.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/"
              className="gradient-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium text-sm inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <button
              onClick={() => {
                // Scroll to jobs section on landing page
                navigate('/');
                setTimeout(() => {
                  document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="bg-muted text-foreground px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-muted/80 transition-colors"
            >
              View Other Open Positions
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Job Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-6 mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="gradient-primary p-3 rounded-xl shrink-0">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">{job.title}</h1>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {job.department}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location || 'On-site'}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.employment_type}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-3">{job.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Application Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Apply for this Position</h2>
          <form onSubmit={handleSubmit} className="card-elevated p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Juan Dela Cruz" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="juan@email.com" required />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+63 912 345 6789" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position Applied For</Label>
                <Input id="position" value={job.title} disabled className="bg-muted" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input id="experience" value={experience} onChange={e => setExperience(e.target.value)} placeholder="e.g., 5 years" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills & Qualifications</Label>
              <Input id="skills" value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g., BLS Certified, ACLS, Patient Care (comma-separated)" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">Resume Upload (PDF or DOC)</Label>
              <div className="relative">
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={e => setResumeFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="resume"
                  className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {resumeFile ? resumeFile.name : 'Click to upload your resume'}
                    </p>
                    <p className="text-xs text-muted-foreground">PDF or DOC, max 20MB</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                placeholder="Tell us why you'd be a great fit for this role..."
                rows={4}
              />
            </div>

            <Button
              type="submit"
              disabled={submitting || !fullName || !email}
              className="w-full gradient-primary text-primary-foreground py-3 rounded-xl font-medium"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>

        </motion.div>
      </div>
    </div>
  );
}
