import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
  HeartPulse, Briefcase, MapPin, Clock, ChevronRight,
  Shield, TrendingUp, Heart, Award, Building2, GraduationCap, Moon, Sun,
  Search, Users,
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

const benefits = [
  { icon: TrendingUp, title: 'Career Growth', description: 'Clear advancement pathways with mentorship and continuous learning programs.' },
  { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive medical, dental, and vision coverage for you and your family.' },
  { icon: Shield, title: 'Job Security', description: 'Stable employment in the ever-growing healthcare industry.' },
  { icon: Award, title: 'Recognition', description: 'Employee appreciation programs and performance-based incentives.' },
  { icon: GraduationCap, title: 'Training & Development', description: 'Funded certifications, conferences, and professional development.' },
  { icon: Building2, title: 'Modern Facilities', description: 'State-of-the-art hospital equipped with the latest medical technology.' },
];

const stats = [
  { value: '500+', label: 'Healthcare Professionals' },
  { value: '50+', label: 'Departments' },
  { value: '15+', label: 'Years of Service' },
  { value: '98%', label: 'Employee Satisfaction' },
];

export default function LandingPage() {
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

  const filteredJobs = useMemo(() => {
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
              <span className="text-muted-foreground text-xs block -mt-1">Hospital</span>
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
            <button
              onClick={() => document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              View All Jobs
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-[0.03]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6">
              <HeartPulse className="w-4 h-4" /> We're Hiring
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Build Your Career in{' '}
              <span className="text-primary">Healthcare</span>
            </h1>
            <p className="text-lg text-muted-foreground mt-6 max-w-2xl leading-relaxed">
              Join Human Resources 1 Hospital — a leading healthcare institution committed to
              excellence in patient care, innovation, and employee well-being. Discover
              opportunities that make a difference.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                to="/careers"
                className="gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                View Open Positions
                <ChevronRight className="w-4 h-4" />
              </Link>
              <a
                href="#about"
                className="bg-muted text-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-muted/80 transition-colors"
              >
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16"
          >
            {stats.map((stat, i) => (
              <div key={i} className="card-elevated p-5 text-center">
                <p className="font-display text-2xl sm:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About / Mission */}
      <section id="about" className="bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                At Human Resources 1 Hospital, we are dedicated to delivering compassionate,
                world-class healthcare to our community. Our team of skilled professionals
                works tirelessly to advance medical science, improve patient outcomes,
                and create an environment where both patients and staff thrive.
              </p>
              <div className="space-y-4">
                {['Patient-centered care excellence', 'Innovation in medical technology', 'Inclusive and supportive work culture', 'Community health & wellness programs'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="grid grid-cols-2 gap-4">
              <div className="gradient-primary rounded-2xl p-6 text-primary-foreground">
                <h3 className="font-display font-bold text-lg">Vision</h3>
                <p className="text-sm opacity-90 mt-2">To be the leading healthcare employer known for nurturing talent and transforming patient care.</p>
              </div>
              <div className="gradient-cool rounded-2xl p-6 text-primary-foreground">
                <h3 className="font-display font-bold text-lg">Values</h3>
                <p className="text-sm opacity-90 mt-2">Integrity, compassion, innovation, teamwork, and continuous improvement.</p>
              </div>
              <div className="gradient-warm rounded-2xl p-6 text-primary-foreground col-span-2">
                <h3 className="font-display font-bold text-lg">Culture</h3>
                <p className="text-sm opacity-90 mt-2">A collaborative workplace that celebrates diversity, encourages growth, and ensures every team member feels valued and empowered.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-foreground">Why Work With Us</h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">We invest in our people because great healthcare starts with a great team.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-elevated p-6 hover:border-primary/30 transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <benefit.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Open Positions */}
      <section id="jobs" className="bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground">Open Positions</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Browse all available opportunities and find the position that's right for you.</p>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-col sm:flex-row gap-3 justify-center">
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
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `${filteredJobs.length} position${filteredJobs.length !== 1 ? 's' : ''} found`}
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
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {jobs.length === 0 ? 'No open positions at the moment. Check back soon!' : 'No positions match your filters.'}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
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
        </div>
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
