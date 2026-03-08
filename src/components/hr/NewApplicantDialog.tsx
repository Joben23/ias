import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star } from 'lucide-react';
import type { Applicant, ApplicantStatus, Department, Position } from '@/data/sampleData';

const positions: Position[] = ['Doctor', 'Nurse', 'Medical Technologist', 'Pharmacist', 'Administrative Staff', 'Security Personnel', 'Maintenance Staff'];
const departments: Department[] = ['Emergency', 'Surgery', 'Pediatrics', 'Cardiology', 'Pharmacy', 'Administration', 'Security', 'Maintenance', 'ICU', 'Radiology'];
const statuses: ApplicantStatus[] = ['Applied', 'Under Screening', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Hired', 'Rejected'];

interface NewApplicantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (applicant: Applicant) => void;
}

export function NewApplicantDialog({ open, onOpenChange, onAdd }: NewApplicantDialogProps) {
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState<Position | ''>('');
  const [department, setDepartment] = useState<Department | ''>('');
  const [experience, setExperience] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [status, setStatus] = useState<ApplicantStatus>('Applied');
  const [notes, setNotes] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const resetForm = () => {
    setFullName('');
    setPosition('');
    setDepartment('');
    setExperience('');
    setRating(0);
    setHoverRating(0);
    setStatus('Applied');
    setNotes('');
    setResumeFile(null);
  };

  const handleSubmit = () => {
    if (!fullName.trim() || !position || !department || !experience) return;

    const expYears = parseInt(experience);
    const newApplicant: Applicant = {
      id: `app-${Date.now()}`,
      fullName: fullName.trim(),
      email: `${fullName.trim().toLowerCase().replace(/\s+/g, '.')}@email.com`,
      phone: '',
      education: '',
      certifications: [],
      positionApplied: position as Position,
      department: department as Department,
      applicationDate: new Date().toISOString().split('T')[0],
      status,
      experience: `${expYears} year${expYears !== 1 ? 's' : ''}`,
      rating: rating || undefined,
      resumeFile: resumeFile?.name,
    };

    onAdd(newApplicant);
    resetForm();
    onOpenChange(false);
  };

  const isValid = fullName.trim() && position && department && experience;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add New Applicant</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
            <Input id="fullName" placeholder="e.g. Juan Dela Cruz" value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>

          {/* Position & Department */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Position Applied For <span className="text-destructive">*</span></Label>
              <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
                <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                <SelectContent>
                  {positions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Department <span className="text-destructive">*</span></Label>
              <Select value={department} onValueChange={(v) => setDepartment(v as Department)}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Experience & Status */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="experience">Years of Experience <span className="text-destructive">*</span></Label>
              <Input id="experience" type="number" min={0} max={50} placeholder="e.g. 5" value={experience} onChange={e => setExperience(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Pipeline Stage</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ApplicantStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-1.5">
            <Label>Rating (optional)</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className="p-0.5 transition-colors"
                  onClick={() => setRating(star === rating ? 0 : star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    className={`w-5 h-5 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-accent text-accent'
                        : 'text-muted-foreground/40'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-xs text-muted-foreground ml-2">{rating}/5</span>
              )}
            </div>
          </div>

          {/* Resume Upload */}
          <div className="space-y-1.5">
            <Label htmlFor="resume">Upload Resume (optional)</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={e => setResumeFile(e.target.files?.[0] || null)}
              className="cursor-pointer file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" placeholder="Any additional notes..." rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>Cancel</Button>
          <Button disabled={!isValid} onClick={handleSubmit} className="gradient-primary">Add Applicant</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
