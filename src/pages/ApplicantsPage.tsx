import { useState } from 'react';
import { applicants, ApplicantStatus, Position } from '@/data/sampleData';
import { ApplicantCard } from '@/components/hr/ApplicantCard';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Users, SlidersHorizontal } from 'lucide-react';

const statusFilters: ApplicantStatus[] = ['Applied', 'Under Screening', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Hired', 'Rejected'];
const positionFilters: Position[] = ['Doctor', 'Nurse', 'Medical Technologist', 'Pharmacist', 'Administrative Staff', 'Security Personnel', 'Maintenance Staff'];

export default function ApplicantsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicantStatus | 'All'>('All');
  const [positionFilter, setPositionFilter] = useState<Position | 'All'>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'pipeline'>('cards');

  const filtered = applicants.filter(a => {
    const matchesSearch = a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.positionApplied.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesPosition = positionFilter === 'All' || a.positionApplied === positionFilter;
    return matchesSearch && matchesStatus && matchesPosition;
  });

  // Group by status for pipeline view
  const pipelineGroups = statusFilters.map(status => ({
    status,
    applicants: applicants.filter(a => a.status === status),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Applicant Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{applicants.length} total applicants in the system</p>
        </div>
        <button className="gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          New Applicant
        </button>
      </div>

      {/* Filters */}
      <div className="card-elevated p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search applicants..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${viewMode === 'cards' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${viewMode === 'pipeline' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === 'All' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            All
          </button>
          {statusFilters.map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === status ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Position filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPositionFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${positionFilter === 'All' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            All Positions
          </button>
          {positionFilters.map(pos => (
            <button
              key={pos}
              onClick={() => setPositionFilter(pos)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${positionFilter === pos ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {viewMode === 'cards' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((app, i) => (
            <ApplicantCard key={app.id} applicant={app} index={i} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No applicants match your filters.
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipelineGroups.map((group, gi) => (
            <div key={group.status} className="shrink-0 w-[280px]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-foreground">{group.status}</span>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{group.applicants.length}</span>
              </div>
              <div className="space-y-2">
                {group.applicants.map((app, i) => (
                  <ApplicantCard key={app.id} applicant={app} index={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
