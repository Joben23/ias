import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Clock,
  Users,
  Edit3,
  Trash2,
  Plus,
  AlertCircle,
  Check,
  Calendar,
} from 'lucide-react';

interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  shift_type: 'Morning' | 'Afternoon' | 'Night' | 'Flexible';
  assigned_employees: number;
  max_employees: number;
  working_days: string[];
  color: string;
}

interface ShiftAssignment {
  id: string;
  employee_id: string;
  employee_name: string;
  position: string;
  shift_id: string;
  shift_name: string;
  effective_date: string;
  end_date?: string;
  status: 'Active' | 'Pending' | 'Completed';
}

export default function ShiftManagementPageNew() {
  const [activeTab, setActiveTab] = useState<'shifts' | 'assignments' | 'calendar'>('shifts');
  const [editingShift, setEditingShift] = useState<string | null>(null);

  // Sample data
  const shifts: Shift[] = [
    {
      id: 'SFT001',
      name: 'Morning Shift',
      start_time: '06:00',
      end_time: '14:00',
      total_hours: 8,
      shift_type: 'Morning',
      assigned_employees: 25,
      max_employees: 30,
      working_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      color: 'bg-yellow-100',
    },
    {
      id: 'SFT002',
      name: 'Afternoon Shift',
      start_time: '14:00',
      end_time: '22:00',
      total_hours: 8,
      shift_type: 'Afternoon',
      assigned_employees: 28,
      max_employees: 30,
      working_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      color: 'bg-blue-100',
    },
    {
      id: 'SFT003',
      name: 'Night Shift',
      start_time: '22:00',
      end_time: '06:00',
      total_hours: 8,
      shift_type: 'Night',
      assigned_employees: 15,
      max_employees: 20,
      working_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      color: 'bg-purple-100',
    },
    {
      id: 'SFT004',
      name: 'Flexible Shift',
      start_time: '08:00',
      end_time: '17:00',
      total_hours: 8,
      shift_type: 'Flexible',
      assigned_employees: 32,
      max_employees: 40,
      working_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      color: 'bg-green-100',
    },
  ];

  const shiftAssignments: ShiftAssignment[] = [
    {
      id: 'ASN001',
      employee_id: 'EMP001',
      employee_name: 'John Doe',
      position: 'Senior Developer',
      shift_id: 'SFT004',
      shift_name: 'Flexible Shift',
      effective_date: '2026-04-01',
      status: 'Active',
    },
    {
      id: 'ASN002',
      employee_id: 'EMP002',
      employee_name: 'Jane Smith',
      position: 'Product Manager',
      shift_id: 'SFT004',
      shift_name: 'Flexible Shift',
      effective_date: '2026-04-01',
      status: 'Active',
    },
    {
      id: 'ASN003',
      employee_id: 'EMP003',
      employee_name: 'Mike Johnson',
      position: 'Designer',
      shift_id: 'SFT001',
      shift_name: 'Morning Shift',
      effective_date: '2026-03-15',
      end_date: '2026-05-15',
      status: 'Completed',
    },
    {
      id: 'ASN004',
      employee_id: 'EMP004',
      employee_name: 'Sarah Wilson',
      position: 'QA Engineer',
      shift_id: 'SFT002',
      shift_name: 'Afternoon Shift',
      effective_date: '2026-05-01',
      status: 'Pending',
    },
  ];

  const statusColors: Record<string, string> = {
    'Active': 'bg-green-100 text-green-700',
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Completed': 'bg-gray-100 text-gray-700',
  };

  const handleDeleteShift = (shiftId: string) => {
    alert(`Delete shift ${shiftId}`);
  };

  const handleEditShift = (shiftId: string) => {
    setEditingShift(editingShift === shiftId ? null : shiftId);
  };

  const handleAssignShift = () => {
    alert('Assign shift to employee');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Shift Management ⏰
        </h1>
        <p className="text-muted-foreground mt-1">Manage work shifts and employee shift assignments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border justify-between">
        <div className="flex gap-4">
          {['shifts', 'assignments', 'calendar'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 px-2 font-medium text-sm transition-colors capitalize ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {activeTab === 'shifts' && (
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Create Shift
          </Button>
        )}
      </div>

      {/* Shifts Tab */}
      {activeTab === 'shifts' && (
        <div className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {shifts.reduce((total, s) => total + s.assigned_employees, 0)} employees assigned to {shifts.length} shifts
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {shifts.map(shift => (
              <Card key={shift.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-16 h-16 ${shift.color} rounded-lg flex items-center justify-center`}>
                          <Clock className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{shift.name}</h4>
                          <p className="text-sm text-muted-foreground">{shift.shift_type} Shift</p>
                        </div>
                      </div>

                      {/* Shift Details */}
                      <div className="grid grid-cols-5 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Time</p>
                          <p className="font-semibold text-foreground">
                            {shift.start_time} - {shift.end_time}
                          </p>
                          <p className="text-muted-foreground text-xs mt-1">{shift.total_hours}h</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Days</p>
                          <p className="font-semibold text-foreground text-xs mt-1">
                            {shift.working_days.join(', ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Assigned</p>
                          <p className="font-semibold text-foreground">
                            {shift.assigned_employees} / {shift.max_employees}
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${(shift.assigned_employees / shift.max_employees) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Available Slots</p>
                          <p className="font-semibold text-green-700">
                            {shift.max_employees - shift.assigned_employees} open
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditShift(shift.id)}
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteShift(shift.id)}
                        className="text-red-600 border-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Employee Shift Assignments</h3>
            <Button size="sm" onClick={handleAssignShift}>
              <Plus className="w-4 h-4 mr-1" />
              Assign Shift
            </Button>
          </div>

          <div className="space-y-3">
            {shiftAssignments.map(assignment => (
              <Card key={assignment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">{assignment.employee_name}</h4>
                        <Badge className={statusColors[assignment.status]}>
                          {assignment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{assignment.position}</p>

                      <div className="grid grid-cols-4 gap-4 text-sm mt-3 pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-muted-foreground text-xs">Assigned Shift</p>
                          <p className="font-semibold text-foreground">{assignment.shift_name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Effective Date</p>
                          <p className="font-semibold text-foreground">{assignment.effective_date}</p>
                        </div>
                        <div>
                          {assignment.end_date && (
                            <>
                              <p className="text-muted-foreground text-xs">End Date</p>
                              <p className="font-semibold text-foreground">{assignment.end_date}</p>
                            </>
                          )}
                        </div>
                        <div className="text-right">
                          <Button size="sm" variant="outline">
                            Change Shift
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              Week of April 28 - May 4, 2026
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Shift Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, idx) => (
                  <div key={day} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                    <span className="font-semibold text-foreground w-24">{day}</span>
                    <div className="flex gap-2 flex-1">
                      <Badge className="bg-yellow-100 text-yellow-700">Morning: 25/30</Badge>
                      <Badge className="bg-blue-100 text-blue-700">Afternoon: 28/30</Badge>
                      {idx < 5 && (
                        <Badge className="bg-purple-100 text-purple-700">Night: 15/20</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
