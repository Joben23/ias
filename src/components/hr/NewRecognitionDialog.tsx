import { useState } from 'react';
import { Recognition } from '@/data/sampleData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const employees = [
  'Mama Coco', 'Stephen Curry', 'Lebron James', 'Rasc Binuya',
  'Tung Tung Tung Sahur', 'Halimaw Magmahal', 'Mr. Long Bomb',
  'Uncle Drew', 'Six Seven', 'High Cortisol', 'Low Cortisol', 'Bronny James',
];

const positions: Record<string, { position: string; department: string }> = {
  'Mama Coco': { position: 'Nurse', department: 'Pediatrics' },
  'Stephen Curry': { position: 'Doctor', department: 'Surgery' },
  'Lebron James': { position: 'Doctor', department: 'Cardiology' },
  'Rasc Binuya': { position: 'Security Personnel', department: 'Security' },
  'Tung Tung Tung Sahur': { position: 'Nurse', department: 'Emergency' },
  'Halimaw Magmahal': { position: 'Pharmacist', department: 'Pharmacy' },
  'Mr. Long Bomb': { position: 'Medical Technologist', department: 'Radiology' },
  'Uncle Drew': { position: 'Administrative Staff', department: 'Administration' },
  'Six Seven': { position: 'Maintenance Staff', department: 'Maintenance' },
  'High Cortisol': { position: 'Doctor', department: 'Emergency' },
  'Low Cortisol': { position: 'Nurse', department: 'ICU' },
  'Bronny James': { position: 'Pharmacist', department: 'Pharmacy' },
};

const categories = ['Performance', 'Teamwork', 'Leadership', 'Innovation', 'Customer Service'];
const awardTypes = ['Employee of the Month', 'Outstanding Physician Award', 'Best Support Staff', 'Peer Recognition'];

interface NewRecognitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (recognition: Recognition) => void;
}

export function NewRecognitionDialog({ open, onOpenChange, onAdd }: NewRecognitionDialogProps) {
  const [employeeName, setEmployeeName] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>();
  const [awardType, setAwardType] = useState('');

  const resetForm = () => {
    setEmployeeName('');
    setTitle('');
    setCategory('');
    setDescription('');
    setDate(undefined);
    setAwardType('');
  };

  const handleSubmit = () => {
    if (!employeeName || !title || !awardType || !description) return;

    const info = positions[employeeName] || { position: 'Staff', department: 'General' };
    const recognition: Recognition = {
      id: `REC-${Date.now()}`,
      employeeName,
      position: info.position as Recognition['position'],
      department: info.department as Recognition['department'],
      awardType,
      description,
      date: date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      likes: 0,
      comments: 0,
    };

    onAdd(recognition);
    toast({ title: '🎉 Recognition Submitted!', description: `${employeeName} has been recognized for "${title}".` });
    resetForm();
    onOpenChange(false);
  };

  const isValid = employeeName && title && awardType && description;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Give Recognition</DialogTitle>
          <DialogDescription>Recognize an employee for their achievements and contributions.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Employee Name *</Label>
            <Select value={employeeName} onValueChange={setEmployeeName}>
              <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>
                {employees.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Recognition Title *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Employee of the Month" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Award Type *</Label>
              <Select value={awardType} onValueChange={setAwardType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {awardTypes.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Date of Recognition</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label>Description / Message *</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Write an appreciation message..." rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!isValid} className="gradient-warm text-primary-foreground border-0">Submit Recognition</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
