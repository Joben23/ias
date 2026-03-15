import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
  HeartPulse, Briefcase, MapPin, Clock, ChevronRight,
  Building2, Search, Moon, Sun, Users,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PublicJob {
  id: string;
  title: string;
  department: string;
  position: string;
  employment_type: string;
  description: string;
  requirements: string[] | null;
  location: string | null;
  closing_date: string | null;
}

export default function CareersPage() {
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase
        .from('job_postings')
        .select('id, title, department, position, employment_type, description, requirements, location, closing_date')
        .eq('status', 'Open')
        .order('created_at', { ascending: false });
      if (data) setJobs(data as PublicJob[]);
      setLoading(false);
    };
    fetchJobs();
  }, []);

  const departments = useMemo(() => [...new Set(jobs.map(j => j.department))], [jobs]);
  const types = useMemo(() => [...new Set(jobs.map(j => j.employment_type))], [jobs]);

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      const matchesSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.department.toLowerCase().includes(search.toLowerCase());
      const matchesDept = deptFilter === 'all' || j.department === deptFilter;
      const matchesType = typeFilter === 'all' || j.employment_type === typeFilter;
      return matchesSearch && matchesDept && matchesType;
    });
  }, [jobs, search, deptFilter, typeFilter]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="gradient-primary p-2 rounded-xl">
              <HeartPulse className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-display font-bold text-foreground text-lg">Human Resources 1</span>
              <span className="text-muted-foreground text-xs block -mt-1">Careers</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-[0.03]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Careers at <span className="text-primary">Human Resources 1 Hospital</span>
            </h1>
            <p className="text-muted-foreground mt-3 max-w-2xl">
              Browse all open positions and find the opportunity that's right for you. Apply online in minutes.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search positions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `${filtered.length} position${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card-elevated p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                <div className="h-3 bg-muted rounded w-1/2 mb-6" />
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {jobs.length === 0 ? 'No open positions at the moment. Check back soon!' : 'No positions match your filters.'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="card-elevated p-6 hover:border-primary/30 transition-all group flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Briefcase className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-pipeline-hired/10 text-pipeline-hired">Open</span>
                </div>

                <h3 className="font-display font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{job.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{job.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {(job.requirements || []).slice(0, 3).map(req => (
                    <span key={req} className="text-[11px] px-2 py-0.5 bg-muted rounded-md text-muted-foreground">{req}</span>
                  ))}
                </div>

                <div className="space-y-2 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {job.department}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {job.location || 'On-site'}</div>
                  <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {job.employment_type}</div>
                  {job.closing_date && (
                    <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Closes {job.closing_date}</div>
                  )}
                </div>

                <Link
                  to={`/careers/apply/${job.id}`}
                  className="gradient-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium text-sm text-center hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  Apply Now <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="gradient-primary p-2 rounded-xl">
                <HeartPulse className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground">Human Resources 1 Hospital</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Human Resources 1 Hospital. All rights reserved.</span>
              <span className="text-border">|</span>
              <Link to="/login" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">Staff Access</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
