import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Download, RefreshCw, Settings } from 'lucide-react';

// Import all modal and component modules
import { ProcessTimeline } from '@/components/performance/ProcessTimeline';
import { StartReviewModal } from '@/components/performance/StartReviewModal';
import { ScheduleReviewModal } from '@/components/performance/ScheduleReviewModal';
import {
  ConfirmPermanentModal,
  ExtendProbationModal,
  TerminateModal,
} from '@/components/performance/EmploymentDecisionModals';
import { ViewDetailsModal } from '@/components/performance/ViewDetailsModal';
import { EmployeeCard, type ReviewStatus } from '@/components/performance/EmployeeCard';
import { SearchFilterBar, type FilterStatus, type SortBy } from '@/components/performance/SearchFilterBar';
import { PerformanceAnalytics, generateDemoAnalyticsData } from '@/components/performance/PerformanceAnalytics';

// Types
interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  avatarUrl?: string;
  reviewStatus: ReviewStatus;
  currentScore?: number;
  nextReviewDate?: string;
  daysUntilReview?: number;
  probationEndDate?: string;
  stageName?: string;
}

interface ReviewDetails {
  id: string;
  employeeName: string;
  reviewDate: string;
  reviewerName: string;
  reviewType: string;
  workPerformance: number;
  skillsAssessment: number;
  behaviorAttitude: number;
  comments: string;
  status: 'completed' | 'in-progress' | 'pending';
}

// Demo employee data
const DEMO_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    position: 'Nurse',
    department: 'Clinical',
    reviewStatus: 'in-progress',
    stageName: '30-Day Review',
    probationEndDate: '2024-02-15',
    currentScore: 72,
    nextReviewDate: '2024-02-01',
    daysUntilReview: 3,
  },
  {
    id: '2',
    name: 'Bob Smith',
    position: 'Senior Nurse',
    department: 'Clinical',
    reviewStatus: 'pending',
    stageName: '60-Day Review',
    probationEndDate: '2024-03-15',
    nextReviewDate: '2024-02-15',
    daysUntilReview: 17,
  },
  {
    id: '3',
    name: 'Carol White',
    position: 'Admin',
    department: 'Administration',
    reviewStatus: 'completed',
    currentScore: 85,
    nextReviewDate: '2024-02-20',
  },
  {
    id: '4',
    name: 'David Lee',
    position: 'Technician',
    department: 'Technical',
    reviewStatus: 'overdue',
    stageName: '90-Day Review',
    probationEndDate: '2024-01-30',
    nextReviewDate: '2024-01-28',
    daysUntilReview: -2,
  },
  {
    id: '5',
    name: 'Emma Davis',
    position: 'Coordinator',
    department: 'Operations',
    reviewStatus: 'in-progress',
    stageName: '30-Day Review',
    probationEndDate: '2024-02-22',
    currentScore: 68,
    nextReviewDate: '2024-02-08',
    daysUntilReview: 10,
  },
  {
    id: '6',
    name: 'Frank Wilson',
    position: 'Senior Admin',
    department: 'Administration',
    reviewStatus: 'pending',
    stageName: '90-Day Review',
    probationEndDate: '2024-02-28',
    nextReviewDate: '2024-02-25',
    daysUntilReview: 27,
  },
];

const DEMO_REVIEWS: Record<string, ReviewDetails> = {
  '3': {
    id: '3',
    employeeName: 'Carol White',
    reviewDate: '2024-01-20',
    reviewerName: 'Dr. Michael Chen',
    reviewType: '30-Day Review',
    workPerformance: 88,
    skillsAssessment: 82,
    behaviorAttitude: 85,
    comments:
      'Carol has demonstrated excellent work performance. She quickly grasps new processes and has shown great initiative in her administrative tasks. Her communication with team members is clear and professional. She has a positive attitude and is always willing to help colleagues.',
    status: 'completed',
  },
};

export default function PerformancePage() {
  // State management
  const [employees, setEmployees] = useState<Employee[]>(DEMO_EMPLOYEES);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(DEMO_EMPLOYEES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');

  // Modal states
  const [startReviewEmployee, setStartReviewEmployee] = useState<Employee | null>(null);
  const [scheduleReviewEmployee, setScheduleReviewEmployee] = useState<Employee | null>(null);
  const [viewDetailsReview, setViewDetailsReview] = useState<ReviewDetails | null>(null);
  const [confirmPermanentEmployee, setConfirmPermanentEmployee] = useState<Employee | null>(null);
  const [extendProbationEmployee, setExtendProbationEmployee] = useState<Employee | null>(null);
  const [terminateEmployee, setTerminateEmployee] = useState<Employee | null>(null);

  // Filter and sort employees
  useEffect(() => {
    let result = [...employees];

    // Search filter
    if (searchQuery.trim()) {
      result = result.filter((emp) =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter((emp) => emp.reviewStatus === filterStatus);
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'department':
        result.sort((a, b) => a.department.localeCompare(b.department));
        break;
      case 'score':
        result.sort((a, b) => (b.currentScore || 0) - (a.currentScore || 0));
        break;
      case 'date':
        result.sort((a, b) => {
          const dateA = new Date(a.nextReviewDate || '').getTime();
          const dateB = new Date(b.nextReviewDate || '').getTime();
          return dateA - dateB;
        });
        break;
    }

    setFilteredEmployees(result);
  }, [employees, searchQuery, filterStatus, sortBy]);

  // Handler functions for modals
  const handleStartReview = (employee: Employee) => {
    setStartReviewEmployee(employee);
  };

  const handleScheduleReview = (employee: Employee) => {
    setScheduleReviewEmployee(employee);
  };

  const handleViewDetails = (employee: Employee) => {
    const review = DEMO_REVIEWS[employee.id];
    if (review) {
      setViewDetailsReview(review);
    } else {
      toast({
        title: 'No Review',
        description: 'No completed review found for this employee',
      });
    }
  };

  const handleConfirmPermanent = (employee: Employee) => {
    setConfirmPermanentEmployee(employee);
  };

  const handleExtendProbation = (employee: Employee) => {
    setExtendProbationEmployee(employee);
  };

  const handleTerminate = (employee: Employee) => {
    setTerminateEmployee(employee);
  };

  // Submit handlers
  const handleStartReviewSubmit = () => {
    if (startReviewEmployee) {
      const updated = employees.map((emp) =>
        emp.id === startReviewEmployee.id
          ? { ...emp, reviewStatus: 'completed' as ReviewStatus, currentScore: 78 }
          : emp
      );
      setEmployees(updated);
      setStartReviewEmployee(null);
      toast({
        title: 'Success',
        description: `Review submitted for ${startReviewEmployee.name}`,
      });
    }
  };

  const handleScheduleReviewSubmit = (data: any) => {
    if (scheduleReviewEmployee) {
      const updated = employees.map((emp) =>
        emp.id === scheduleReviewEmployee.id
          ? { ...emp, reviewStatus: 'in-progress' as ReviewStatus }
          : emp
      );
      setEmployees(updated);
      setScheduleReviewEmployee(null);
      toast({
        title: 'Success',
        description: `Review scheduled for ${scheduleReviewEmployee.name}`,
      });
    }
  };

  const handleConfirmPermanentSubmit = (data: any) => {
    if (confirmPermanentEmployee) {
      const updated = employees.filter((emp) => emp.id !== confirmPermanentEmployee.id);
      setEmployees(updated);
      setConfirmPermanentEmployee(null);
      toast({
        title: 'Success',
        description: `${confirmPermanentEmployee.name} has been confirmed for permanent position`,
      });
    }
  };

  const handleExtendProbationSubmit = (data: any) => {
    if (extendProbationEmployee) {
      toast({
        title: 'Success',
        description: `Probation extended for ${extendProbationEmployee.name}`,
      });
      setExtendProbationEmployee(null);
    }
  };

  const handleTerminateSubmit = (data: any) => {
    if (terminateEmployee) {
      const updated = employees.filter((emp) => emp.id !== terminateEmployee.id);
      setEmployees(updated);
      setTerminateEmployee(null);
      toast({
        title: 'Success',
        description: `Termination initiated for ${terminateEmployee.name}`,
        variant: 'destructive',
      });
    }
  };

  const analyticsData = generateDemoAnalyticsData();

  return (
    <div className="min-h-screen bg-background py-8 px-4 md:px-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Performance Management</h1>
        <p className="text-muted-foreground">
          Manage employee onboarding, track performance reviews, and make employment decisions
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2 mb-8"
      >
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
        <Button variant="outline" className="flex items-center gap-2 ml-auto">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </motion.div>

      {/* Process Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-8"
      >
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Probation Process Timeline</h2>
            <ProcessTimeline stages={[
              { id: 1, label: '30-Day Review', days: 30, status: 'completed', completedDate: 'Jan 25, 2024' },
              { id: 2, label: '60-Day Review', days: 60, status: 'in-progress' },
              { id: 3, label: '90-Day Review', days: 90, status: 'pending' },
              { id: 4, label: 'Employment Confirmation', days: 0, status: 'pending' },
            ]} />
          </div>
        </Card>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <SearchFilterBar
          searchQuery={searchQuery}
          filterStatus={filterStatus}
          sortBy={sortBy}
          resultCount={filteredEmployees.length}
          onSearchChange={setSearchQuery}
          onFilterChange={setFilterStatus}
          onSortChange={setSortBy}
        />
      </motion.div>

      {/* Performance Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-8"
      >
        <Card>
          <div className="p-6">
            <PerformanceAnalytics data={analyticsData} />
          </div>
        </Card>
      </motion.div>

      {/* Employees Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-bold mb-4">Employee Reviews ({filteredEmployees.length})</h2>
        {filteredEmployees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((employee, index) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <EmployeeCard
                  {...employee}
                  onStartReview={() => handleStartReview(employee)}
                  onScheduleReview={() => handleScheduleReview(employee)}
                  onViewDetails={() => handleViewDetails(employee)}
                  onConfirmPermanent={() => handleConfirmPermanent(employee)}
                  onExtendProbation={() => handleExtendProbation(employee)}
                  onTerminate={() => handleTerminate(employee)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No employees found matching your filters</p>
          </Card>
        )}
      </motion.div>

      {/* MODALS */}

      {/* Start Review Modal */}
      <StartReviewModal
        open={!!startReviewEmployee}
        onOpenChange={() => setStartReviewEmployee(null)}
        employeeName={startReviewEmployee?.name || ''}
        employeePosition={startReviewEmployee?.position || ''}
        reviewType={startReviewEmployee?.stageName || ''}
        onSubmit={handleStartReviewSubmit}
      />

      {/* Schedule Review Modal */}
      <ScheduleReviewModal
        open={!!scheduleReviewEmployee}
        onOpenChange={() => setScheduleReviewEmployee(null)}
        employeeName={scheduleReviewEmployee?.name || ''}
        onSchedule={handleScheduleReviewSubmit}
      />

      {/* View Details Modal */}
      <ViewDetailsModal
        open={!!viewDetailsReview}
        onOpenChange={() => setViewDetailsReview(null)}
        review={viewDetailsReview}
        onDownload={(id) => {
          toast({
            title: 'Downloaded',
            description: 'Review PDF downloaded successfully',
          });
        }}
        onPrint={(id) => {
          window.print();
        }}
      />

      {/* Confirm Permanent Modal */}
      <ConfirmPermanentModal
        open={!!confirmPermanentEmployee}
        onOpenChange={() => setConfirmPermanentEmployee(null)}
        employeeName={confirmPermanentEmployee?.name || ''}
        onConfirm={handleConfirmPermanentSubmit}
      />

      {/* Extend Probation Modal */}
      <ExtendProbationModal
        open={!!extendProbationEmployee}
        onOpenChange={() => setExtendProbationEmployee(null)}
        employeeName={extendProbationEmployee?.name || ''}
        onExtend={handleExtendProbationSubmit}
      />

      {/* Terminate Modal */}
      <TerminateModal
        open={!!terminateEmployee}
        onOpenChange={() => setTerminateEmployee(null)}
        employeeName={terminateEmployee?.name || ''}
        onTerminate={handleTerminateSubmit}
      />
    </div>
  );
}
