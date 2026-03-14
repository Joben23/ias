import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface OnboardingEmployee {
  id: string;
  full_name: string;
  position: string;
  department: string;
  employee_id: string;
  start_date: string | null;
  onboarding_status: string;
  email: string;
}

export interface OnboardingTask {
  id: string;
  employee_id: string;
  task_name: string;
  task_category: string;
  status: string;
  completed_at: string | null;
}

export interface OnboardingDocument {
  id: string;
  employee_id: string;
  task_id: string | null;
  document_name: string;
  document_type: string;
  file_path: string;
  uploaded_at: string;
}

export interface Orientation {
  id: string;
  employee_id: string;
  orientation_date: string;
  orientation_time: string;
  location: string;
  trainer_name: string;
  status: string;
  notes: string | null;
}

export function useOnboardingEmployees() {
  return useQuery({
    queryKey: ['onboarding-employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .neq('onboarding_status', 'Employee Activated')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as OnboardingEmployee[];
    },
  });
}

export function useOnboardingTasks(employeeId: string | null) {
  return useQuery({
    queryKey: ['onboarding-tasks', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      const { data, error } = await supabase
        .from('onboarding_tasks')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as OnboardingTask[];
    },
    enabled: !!employeeId,
  });
}

export function useOnboardingDocuments(employeeId: string | null) {
  return useQuery({
    queryKey: ['onboarding-documents', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      const { data, error } = await supabase
        .from('onboarding_documents')
        .select('*')
        .eq('employee_id', employeeId)
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      return data as OnboardingDocument[];
    },
    enabled: !!employeeId,
  });
}

export function useOrientations(employeeId: string | null) {
  return useQuery({
    queryKey: ['orientations', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      const { data, error } = await supabase
        .from('orientations')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Orientation[];
    },
    enabled: !!employeeId,
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, currentStatus }: { taskId: string; currentStatus: string }) => {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const { error } = await supabase
        .from('onboarding_tasks')
        .update({
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-employees'] });
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      taskId,
      file,
      documentType,
    }: {
      employeeId: string;
      taskId?: string;
      file: File;
      documentType: string;
    }) => {
      const filePath = `${employeeId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('onboarding-documents')
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('onboarding_documents').insert({
        employee_id: employeeId,
        task_id: taskId || null,
        document_name: file.name,
        document_type: documentType,
        file_path: filePath,
      });
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-documents'] });
      toast({ title: 'Document uploaded successfully' });
    },
    onError: (err: Error) => {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    },
  });
}

export function useScheduleOrientation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orientation: Omit<Orientation, 'id'>) => {
      const { error } = await supabase.from('orientations').insert(orientation);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orientations'] });
      toast({ title: 'Orientation scheduled successfully' });
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to schedule orientation', description: err.message, variant: 'destructive' });
    },
  });
}

export function useUpdateOnboardingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ employeeId, status }: { employeeId: string; status: string }) => {
      const { error } = await supabase
        .from('employees')
        .update({ onboarding_status: status })
        .eq('id', employeeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-employees'] });
      toast({ title: 'Onboarding status updated' });
    },
  });
}
