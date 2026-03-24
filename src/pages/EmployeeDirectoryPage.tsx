import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Briefcase, Search, Filter, CheckCircle2, Clock } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminResetPasswordDialog } from '@/components/AdminResetPasswordDialog';
import { AdminAccountStatusDialog, AccountStatus } from '@/components/AdminAccountStatusDialog';

interface Employee {
  id: string;
  user_id: string;
  full_name: string;
  position: string;
  department: string;
  employee_id: string;
  email: string;
  phone?: string;
  start_date?: string;
  onboarding_status?: string;
  status?: string;
}

export default function EmployeeDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading, error } = useQuery({
    queryKey: ['active-employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, user_id, full_name, position, department, employee_id, email, phone, start_date, onboarding_status, status')
        .eq('status', 'Active')
        .order('full_name');
      if (error) throw error;
      return (data as any || []) as Employee[];
    },
  });

  // Filter and search employees
  const filteredEmployees = useMemo(() => {
    let result = [...employees];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(emp =>
        emp.full_name.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term) ||
        emp.employee_id.toLowerCase().includes(term) ||
        emp.position.toLowerCase().includes(term)
      );
    }

    // Department filter
    if (departmentFilter && departmentFilter !== 'all') {
      result = result.filter(emp => emp.department === departmentFilter);
    }

    // Position filter
    if (positionFilter && positionFilter !== 'all') {
      result = result.filter(emp => emp.position === positionFilter);
    }

    // Sort
    if (sortBy === 'date' && employees.length > 0) {
      result.sort((a, b) => {
        const dateA = new Date(a.start_date || 0).getTime();
        const dateB = new Date(b.start_date || 0).getTime();
        return dateB - dateA; // Most recent first
      });
    }

    return result;
  }, [employees, searchTerm, departmentFilter, positionFilter, sortBy]);

  // Get unique values for filters
  const departments = useMemo(() => [...new Set(employees.map(e => e.department))].sort(), [employees]);
  const positions = useMemo(() => [...new Set(employees.map(e => e.position))].sort(), [employees]);

  const departmentColors: Record<string, string> = {
    Cardiology: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    Emergency: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    Surgery: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Pediatrics: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'ICU': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    Radiology: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    Pharmacy: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    Administration: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    Security: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    Maintenance: 'bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-200',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Employee Directory</h1>
        <p className="text-muted-foreground text-sm mt-1">Active hospital employees and their information</p>
      </div>

      {/* Search and Filters */}
      <div className="card-elevated p-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Filter className="w-4 h-4 text-primary" />
          <p className="text-sm font-medium text-foreground">Search & Filter</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, email, ID, or position..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Department Filter */}
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Position Filter */}
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map(pos => (
                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(val) => setSortBy(val as 'name' | 'date')}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="date">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="text-xs text-muted-foreground">
          Showing {filteredEmployees.length} of {employees.length} employees
        </div>
      </div>

      {/* Employee grid */}
      {isLoading ? (
        <div className="card-elevated p-8 text-center text-muted-foreground">Loading employees...</div>
      ) : error ? (
        <div className="card-elevated p-8 text-center">
          <p className="text-destructive font-medium">Error loading employees</p>
          <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
        </div>
      ) : employees.length === 0 ? (
        <div className="card-elevated p-8 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No active employees found</p>
          <p className="text-xs text-muted-foreground mt-1">Employees will appear here after completing onboarding</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="card-elevated p-8 text-center">
          <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No employees match your filters</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredEmployees.map((employee, i) => {
            const initials = employee.full_name.split(' ').map(n => n[0]).join('').slice(0, 2);
            const deptColor = departmentColors[employee.department] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';

            return (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="card-elevated hover:shadow-md transition-shadow p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="gradient-primary w-12 h-12 rounded-xl flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-semibold text-foreground truncate">{employee.full_name}</h4>
                    <p className="text-sm text-muted-foreground">{employee.employee_id}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground truncate">{employee.position}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${deptColor}`}>
                      {employee.department}
                    </span>
                  </div>
                  {employee.email && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground truncate">{employee.email}</span>
                    </div>
                  )}
                  {employee.phone && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">{employee.phone}</span>
                    </div>
                  )}
                </div>

                {/* Admin Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  <AdminResetPasswordDialog
                    employeeId={employee.user_id}
                    employeeName={employee.full_name}
                    employeeEmail={employee.email}
                  />
                  <AdminAccountStatusDialog
                    employeeId={employee.id}
                    employeeName={employee.full_name}
                    currentStatus={employee.status as AccountStatus}
                    onStatusChange={() => queryClient.invalidateQueries({ queryKey: ['active-employees'] })}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}