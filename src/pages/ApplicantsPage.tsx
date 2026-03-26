import { useState, useEffect } from 'react';
import { Applicant, ApplicantStatus, Position } from '@/data/sampleData';
import { ApplicantCard } from '@/components/hr/ApplicantCard';
import { ApplicantDetailDialog } from '@/components/hr/ApplicantDetailDialog';
import { motion } from 'framer-motion';
import { Search, Users, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const statusFilters: ApplicantStatus[] = ['Applied', 'Under Screening', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected', 'Offer Sent', 'Offer Accepted', 'Offer Declined', 'Hired', 'Rejected'];
const positionFilters: Position[] = ['Doctor', 'Nurse', 'Medical Technologist', 'Pharmacist', 'Administrative Staff', 'Security Personnel', 'Maintenance Staff'];

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicantStatus | 'All'>('All');
  const [positionFilter, setPositionFilter] = useState<Position | 'All'>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'pipeline'>('cards');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    const fetchApplicants = async () => {
      const { data } = await supabase
        .from('applicants')
        .select('*')
        .order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const mapped: Applicant[] = data.map(row => ({
          id: row.id,
          fullName: row.full_name,
          email: row.email,
          phone: row.phone || '',
          education: row.education || '',
          certifications: row.certifications || [],
          positionApplied: row.position_applied as Position,
          department: row.department as Applicant['department'],
          applicationDate: row.application_date,
          status: row.status as ApplicantStatus,
          experience: row.experience || '',
          resumeFile: row.resume_file || undefined,
          rating: row.rating ? Number(row.rating) : undefined,
        }));
        setApplicants(mapped);
      } else {
        setApplicants([]);
      }
    };
    fetchApplicants();
  }, []);

  const handleStatusChange = (id: string, status: ApplicantStatus) => {
    setApplicants(prev =>
      prev.map(a => a.id === id ? { ...a, status } : a)
    );
  };

  const handleCardClick = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setDetailOpen(true);
  };

  const filtered = applicants.filter(a => {
    const matchesSearch = a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.positionApplied.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesPosition = positionFilter === 'All' || a.positionApplied === positionFilter;
    return matchesSearch && matchesStatus && matchesPosition;
  });

  const pipelineGroups = statusFilters.map(status => ({
    status,
    applicants: applicants.filter(a => a.status === status),
  }));

  return (
    <div className="space-y-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-display font-bold text-foreground">Applicant Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{applicants.length} total applicants in the system</p>
        </div>
      </div>

      <ApplicantDetailDialog
        applicant={selectedApplicant}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onStatusChange={handleStatusChange}
        onHire={() => {}}
      />

      {/* Filters */}
      <div className="card-elevated p-3 space-y-3 overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search applicants..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-muted border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${viewMode === 'cards' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${viewMode === 'pipeline' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status filters */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 pb-1">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${statusFilter === 'All' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              All
            </button>
            {statusFilters.map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${statusFilter === status ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Position filters */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 pb-1">
            <button
              onClick={() => setPositionFilter('All')}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${positionFilter === 'All' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              All Positions
            </button>
            {positionFilters.map(pos => (
              <button
                key={pos}
                onClick={() => setPositionFilter(pos)}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${positionFilter === pos ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'cards' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((app, i) => (
            <div key={app.id} onClick={() => handleCardClick(app)} className="cursor-pointer">
              <ApplicantCard applicant={app} index={i} />
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No applicants match your filters.
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pipelineGroups.map((group) => (
            <div key={group.status} className="min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-foreground">{group.status}</span>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{group.applicants.length}</span>
              </div>
              <div className="space-y-2">
                {group.applicants.map((app, i) => (
                  <div key={app.id} onClick={() => handleCardClick(app)} className="cursor-pointer">
                    <ApplicantCard applicant={app} index={i} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
