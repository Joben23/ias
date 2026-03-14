import { useState } from 'react';
import { CalendarDays, Clock, MapPin, User, Plus } from 'lucide-react';
import { useOrientations, useScheduleOrientation } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

interface Props {
  employeeId: string;
}

export function OrientationSection({ employeeId }: Props) {
  const { data: orientations = [] } = useOrientations(employeeId);
  const schedule = useScheduleOrientation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    orientation_date: '',
    orientation_time: '',
    location: 'Main Hospital Building',
    trainer_name: '',
  });

  const handleSubmit = () => {
    schedule.mutate(
      {
        employee_id: employeeId,
        ...form,
        status: 'Scheduled',
        notes: null,
      },
      { onSuccess: () => { setOpen(false); setForm({ orientation_date: '', orientation_time: '', location: 'Main Hospital Building', trainer_name: '' }); } }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-display font-semibold text-foreground text-sm">Orientation</h4>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Schedule Orientation</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div>
                <Label className="text-xs">Date</Label>
                <Input type="date" value={form.orientation_date} onChange={e => setForm(p => ({ ...p, orientation_date: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Time</Label>
                <Input type="time" value={form.orientation_time} onChange={e => setForm(p => ({ ...p, orientation_time: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Location</Label>
                <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Trainer Name</Label>
                <Input value={form.trainer_name} onChange={e => setForm(p => ({ ...p, trainer_name: e.target.value }))} placeholder="e.g. HR Manager" />
              </div>
              <Button onClick={handleSubmit} disabled={!form.orientation_date || !form.trainer_name || schedule.isPending} className="w-full gradient-primary text-primary-foreground">
                {schedule.isPending ? 'Scheduling...' : 'Schedule Orientation'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {orientations.length > 0 ? (
        <div className="space-y-2">
          {orientations.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-xl bg-pipeline-screening/5 border border-pipeline-screening/10"
            >
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-foreground"><CalendarDays className="w-3.5 h-3.5 text-pipeline-screening" />{o.orientation_date}</span>
                <span className="flex items-center gap-1 text-foreground"><Clock className="w-3.5 h-3.5 text-pipeline-screening" />{o.orientation_time}</span>
                <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3.5 h-3.5" />{o.location}</span>
                <span className="flex items-center gap-1 text-muted-foreground"><User className="w-3.5 h-3.5" />{o.trainer_name}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-1.5 inline-block ${
                o.status === 'Completed' ? 'bg-pipeline-hired/10 text-pipeline-hired' : 'bg-pipeline-screening/10 text-pipeline-screening'
              }`}>
                {o.status}
              </span>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No orientation scheduled yet.</p>
      )}
    </div>
  );
}
