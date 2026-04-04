import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Shield, Building, DollarSign, Calendar, TrendingUp, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Link } from 'react-router-dom';

interface Employee {
  id: string;
  full_name: string;
  employee_id: string;
  position: string;
  department: string;
  employment_status: string;
}

interface EmployeeBenefit {
  id: string;
  employee_id: string;
  benefit_id: string;
  contribution_amount: number;
  employer_share: number;
  employee_share: number;
  status: 'active' | 'inactive';
  created_at: string;
  benefits: {
    name: string;
    type: string;
    description: string | null;
  };
}

interface BenefitTransaction {
  id: string;
  employee_id: string;
  benefit_id: string;
  amount: number;
  transaction_type: 'deduction' | 'contribution';
  transaction_date: string;
  created_at: string;
  benefits: {
    name: string;
    type: string;
  };
}

export default function Hr4EmployeeBenefitsPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employeeBenefits, setEmployeeBenefits] = useState<EmployeeBenefit[]>([]);
  const [benefitTransactions, setBenefitTransactions] = useState<BenefitTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData();
    }
  }, [employeeId]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchEmployee(),
        fetchEmployeeBenefits(),
        fetchBenefitTransactions(),
      ]);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployee = async () => {
    if (!employeeId) return;

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single();

      if (error) throw error;
      setEmployee(data);
    } catch (error) {
      console.error('Error fetching employee:', error);
      setEmployee(null);
    }
  };

  const fetchEmployeeBenefits = async () => {
    if (!employeeId) return;

    try {
      const { data, error } = await supabase
        .from('employee_benefits')
        .select(`
          *,
          benefits:benefit_id (
            name,
            type,
            description
          )
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployeeBenefits(data || []);
    } catch (error) {
      console.error('Error fetching employee benefits:', error);
      setEmployeeBenefits([]);
    }
  };

  const fetchBenefitTransactions = async () => {
    if (!employeeId) return;

    try {
      const { data, error } = await supabase
        .from('benefit_transactions')
        .select(`
          *,
          benefits:benefit_id (
            name,
            type
          )
        `)
        .eq('employee_id', employeeId)
        .order('transaction_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setBenefitTransactions(data || []);
    } catch (error) {
      console.error('Error fetching benefit transactions:', error);
      setBenefitTransactions([]);
    }
  };

  const getTotalMonthlyContributions = () => {
    return employeeBenefits
      .filter(eb => eb.status === 'active')
      .reduce((sum, eb) => sum + eb.contribution_amount, 0);
  };

  const getEmployerContributions = () => {
    return employeeBenefits
      .filter(eb => eb.status === 'active')
      .reduce((sum, eb) => sum + eb.employer_share, 0);
  };

  const getEmployeeContributions = () => {
    return employeeBenefits
      .filter(eb => eb.status === 'active')
      .reduce((sum, eb) => sum + eb.employee_share, 0);
  };

  const getGovernmentBenefits = () => {
    return employeeBenefits.filter(eb => eb.benefits?.type === 'government');
  };

  const getCompanyBenefits = () => {
    return employeeBenefits.filter(eb => eb.benefits?.type === 'company');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading employee benefits...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Employee not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/hr4/benefits">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Benefits
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{employee.full_name}</h1>
          <p className="text-muted-foreground">Employee ID: {employee.employee_id}</p>
        </div>
      </div>

      {/* Employee Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Position</Label>
              <p className="text-lg font-medium">{employee.position}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Department</Label>
              <p className="text-lg font-medium">{employee.department}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <Badge variant={employee.employment_status === 'active' ? 'default' : 'secondary'}>
                {employee.employment_status}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Benefits</Label>
              <p className="text-lg font-medium">{employeeBenefits.length} active</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₱{getTotalMonthlyContributions().toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employer Share</CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₱{getEmployerContributions().toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employee Share</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₱{getEmployeeContributions().toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Benefits</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{employeeBenefits.filter(eb => eb.status === 'active').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Government Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Government Benefits</CardTitle>
          <CardDescription>SSS, PhilHealth, Pag-IBIG and other government-mandated benefits</CardDescription>
        </CardHeader>
        <CardContent>
          {getGovernmentBenefits().length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No government benefits assigned to this employee.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benefit</TableHead>
                  <TableHead>Total Contribution</TableHead>
                  <TableHead>Employer Share</TableHead>
                  <TableHead>Employee Share</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getGovernmentBenefits().map((benefit) => (
                  <TableRow key={benefit.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{benefit.benefits?.name}</div>
                        {benefit.benefits?.description && (
                          <div className="text-sm text-muted-foreground">{benefit.benefits.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>₱{benefit.contribution_amount.toLocaleString()}</TableCell>
                    <TableCell>₱{benefit.employer_share.toLocaleString()}</TableCell>
                    <TableCell>₱{benefit.employee_share.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={benefit.status === 'active' ? 'default' : 'secondary'}>
                        {benefit.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(benefit.created_at), 'MMM dd, yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Company Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Company Benefits</CardTitle>
          <CardDescription>Allowances, perks, and other company-provided benefits</CardDescription>
        </CardHeader>
        <CardContent>
          {getCompanyBenefits().length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No company benefits assigned to this employee.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benefit</TableHead>
                  <TableHead>Total Contribution</TableHead>
                  <TableHead>Employer Share</TableHead>
                  <TableHead>Employee Share</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCompanyBenefits().map((benefit) => (
                  <TableRow key={benefit.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{benefit.benefits?.name}</div>
                        {benefit.benefits?.description && (
                          <div className="text-sm text-muted-foreground">{benefit.benefits.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>₱{benefit.contribution_amount.toLocaleString()}</TableCell>
                    <TableCell>₱{benefit.employer_share.toLocaleString()}</TableCell>
                    <TableCell>₱{benefit.employee_share.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={benefit.status === 'active' ? 'default' : 'secondary'}>
                        {benefit.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(benefit.created_at), 'MMM dd, yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Benefit Transactions History */}
      <Card>
        <CardHeader>
          <CardTitle>Benefits Transaction History</CardTitle>
          <CardDescription>History of benefit contributions and deductions</CardDescription>
        </CardHeader>
        <CardContent>
          {benefitTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No benefit transactions recorded yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benefit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Transaction Type</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {benefitTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.benefits?.name}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.benefits?.type === 'government' ? 'default' : 'secondary'}>
                        {transaction.benefits?.type}
                      </Badge>
                    </TableCell>
                    <TableCell>₱{transaction.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.transaction_type === 'deduction' ? 'destructive' : 'default'}>
                        {transaction.transaction_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}