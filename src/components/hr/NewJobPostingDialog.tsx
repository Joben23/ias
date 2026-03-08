import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { JobPosting, Department } from '@/data/sampleData';

const departments: Department[] = ['Emergency', 'Surgery', 'Pediatrics', 'Cardiology', 'Pharmacy', 'Administration', 'Security', 'Maintenance', 'ICU', 'Radiology'];
const jobTypes = ['Full-Time', 'Part-Time', 'Contract'] as const;
const statuses = ['Open', 'Closed', 'On Hold'] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (job: JobPosting) => void;
}

export default function NewJobPostingDialog({ open, onOpenChange, onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState<Department>('Emergency');
  const [employmentType, setEmploymentType] = useState<JobPosting['employmentType']>('Full-Time');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [experience, setExperience] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [deadline, setDeadline] = useState<Date>();
  const [status, setStatus] = useState<JobPosting['status']>('Open');

  const reset = () => {
    setTitle(''); setDepartment('Emergency'); setEmploymentType('Full-Time');
    setLocation(''); setSalaryRange(''); setExperience('');
    setDescription(''); setRequirements(''); setDeadline(undefined); setStatus('Open');
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return;
    const job: JobPosting = {
      id: `job-${Date.now()}`,
      title: title.trim(),
      department,
      position: 'Doctor',
      employmentType,
      description: description.trim(),
      requirements: requirements.split(',').map(r => r.trim()).filter(Boolean),
      applicantCount: 0,
      postedDate: format(new Date(), 'MMM d, yyyy'),
      closingDate: deadline ? format(deadline, 'MMM d, yyyy') : 'TBD',
      status,
    };
    onAdd(job);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Post New Job</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Job Title *</label>
              <Input placeholder="e.g. Senior Nurse" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Department</label>
              <Select value={department} onValueChange={v => setDepartment(v as Department)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Job Type</label>
              <Select value={employmentType} onValueChange={v => setEmploymentType(v as JobPosting['employmentType'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{jobTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Work Location</label>
              <Input placeholder="e.g. Main Hospital Branch" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Salary Range</label>
              <Input placeholder="e.g. $50k–$70k" value={salaryRange} onChange={e => setSalaryRange(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Required Experience</label>
              <Input placeholder="e.g. 3–5 years" value={experience} onChange={e => setExperience(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Status</label>
              <Select value={status} onValueChange={v => setStatus(v as JobPosting['status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Application Deadline</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Job Description *</label>
            <Textarea placeholder="Describe the role and responsibilities..." rows={3} value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Required Skills / Qualifications</label>
            <Textarea placeholder="Comma-separated, e.g. BLS Certification, 3+ years experience" rows={2} value={requirements} onChange={e => setRequirements(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !description.trim()}>Publish Job</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
