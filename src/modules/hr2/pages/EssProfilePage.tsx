import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { ChangePasswordSection } from '@/components/ChangePasswordSection';
import { User, Phone } from 'lucide-react';

interface EmployeeRecord {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: string;
  employee_id: string;
}

export default function EssProfilePage() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<EmployeeRecord | null>(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchEmployeeProfile();
  }, [user]);

  const fetchEmployeeProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.warn('ESS profile fetch failed:', error);
        setEmployee(null);
      } else if (data) {
        setEmployee(data as EmployeeRecord);
        setPhone((data as EmployeeRecord).phone || '');
      }
    } catch (err) {
      console.error('ESS profile fetch error:', err);
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    try {
      const { error } = await supabase
        .from('employees')
        .update({ phone })
        .eq('id', employee.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Phone number updated.',
      });

      fetchEmployeeProfile();
    } catch (err: any) {
      console.error('Error updating phone:', err);
      toast({
        title: 'Error',
        description: err.message || 'Could not update phone number.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Profile not found</h2>
        <p className="text-muted-foreground">Employee record is missing or not linked.
          <Button className="ml-2" variant="outline" onClick={() => navigate('/hr2/ess')}>Go to ESS Home</Button>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Employee Profile</CardTitle>
          <CardDescription>Update your contact details and manage your access.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback>{employee.full_name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{employee.full_name}</h2>
              <p className="text-muted-foreground">{employee.position} • {employee.department}</p>
              <Badge className="mt-1">{employee.status}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <Label>Email</Label>
              <Input value={employee.email} readOnly />
            </div>
            <div>
              <Label>Employee ID</Label>
              <Input value={employee.employee_id || employee.id} readOnly />
            </div>
          </div>

          <form onSubmit={handlePhoneUpdate} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button type="submit">Save Phone</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ChangePasswordSection />
    </div>
  );
}
