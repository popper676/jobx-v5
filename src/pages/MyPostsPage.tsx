import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ArrowUpDown,
  Edit3,
  Trash2,
  Users,
  ChevronRight,
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  MoreHorizontal,
  Plus,
  LayoutGrid,
  LayoutList,
  BadgeCheck,
  ShieldCheck,
  RefreshCcw,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import FilterTabs from '../components/employer/FilterTabs';
import StatusBadge from '../components/employer/StatusBadge';
import HoverCard from '../components/employer/HoverCard';
import SpotlightCard from '../components/employer/SpotlightCard';
import ScrollReveal from '../components/employer/ScrollReveal';
import MagneticButton from '../components/employer/MagneticButton';
import ParallaxCard from '../components/employer/ParallaxCard';
import EmptyState from '../components/employer/EmptyState';
import Breadcrumb from '../components/employer/Breadcrumb';
import AnimatedModal from '../components/employer/AnimatedModal';
import { employerJobService, EmployerJob, EmployerJobStatus } from '../services/employerJobService';

type EditableJobFields = Pick<EmployerJob, 'title' | 'location' | 'salary' | 'status'>;

export default function MyPostsPage() {
  const [jobs, setJobs] = useState<EmployerJob[]>(() => employerJobService.getAll());
  const [activeFilter, setActiveFilter] = useState<'All' | EmployerJobStatus>('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'recent' | 'applicants' | 'views'>('recent');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [editingJob, setEditingJob] = useState<EmployerJob | null>(null);
  const [editForm, setEditForm] = useState<EditableJobFields>({ title: '', location: '', salary: '', status: 'Draft' });
  const [actionError, setActionError] = useState('');
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    let list = [...jobs];
    if (activeFilter !== 'All') {
      list = list.filter((j) => j.status === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((j) =>
        j.title.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.salary.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case 'applicants':
        list.sort((a, b) => b.applicants - a.applicants);
        break;
      case 'views':
        list.sort((a, b) => b.views - a.views);
        break;
      default:
        break;
    }
    return list;
  }, [jobs, activeFilter, search, sort]);

  const counts = useMemo(
    () => ({
      All: jobs.length,
      Active: jobs.filter((j) => j.status === 'Active').length,
      Draft: jobs.filter((j) => j.status === 'Draft').length,
      Closed: jobs.filter((j) => j.status === 'Closed').length,
    }),
    [jobs]
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this job post?')) {
      const result = employerJobService.remove(id);
      if (!result.ok) {
        setActionError(result.error || 'Unable to delete this job post.');
        return;
      }
      setActionError('');
      setJobs(result.jobs);
    }
  };

  const openEdit = (job: EmployerJob) => {
    setEditingJob(job);
    setEditForm({ title: job.title, location: job.location, salary: job.salary, status: job.status });
    setActionError('');
  };

  const saveEdit = () => {
    if (!editingJob) return;
    const result = employerJobService.update(editingJob.id, editForm);
    if (!result.ok) {
      setActionError(result.error || 'Unable to save this job post.');
      return;
    }
    setActionError('');
    setJobs(result.jobs);
    setEditingJob(null);
  };

  const toggleStatus = (job: EmployerJob) => {
    const nextStatus: EmployerJobStatus = job.status === 'Active' ? 'Closed' : 'Active';
    const result = employerJobService.update(job.id, {
      title: job.title,
      location: job.location,
      salary: job.salary,
      status: nextStatus,
    });
    if (!result.ok) {
      setActionError(result.error || 'Unable to update the job status.');
      return;
    }
    setActionError('');
    setJobs(result.jobs);
  };

  const reconfirmHiring = (job: EmployerJob) => {
    const result = employerJobService.reconfirm(job.id);
    if (!result.ok) {
      setActionError(result.error || 'Unable to reconfirm this job post.');
      return;
    }
    setActionError('');
    setJobs(result.jobs);
  };

  const tabList = [
    { label: 'All', key: 'All', count: counts.All },
    { label: 'Active', key: 'Active', count: counts.Active },
    { label: 'Draft', key: 'Draft', count: counts.Draft },
    { label: 'Closed', key: 'Closed', count: counts.Closed },
  ];

  return (
    <div className="min-h-screen bg-[#F8F3F0]/80">
      <div className="bg-white border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Job Posts</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage and track all your job listings</p>
            </div>
            <Link
              to="/post-job"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all shrink-0 bg-[#014BAA] hover:bg-[#013b86]"
            >
              <Plus className="w-4 h-4" />
              Post New Job
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={[{ label: 'Dashboard', path: '/employer' }, { label: 'My Posts' }]} />

        <section className="mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-[#f6f9ff] via-white to-emerald-50/55 shadow-sm">
          <div className="grid gap-px bg-blue-100/70 sm:grid-cols-[1.4fr_0.8fr_0.8fr]">
            <div className="flex items-start gap-3 bg-white/90 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#014BAA] text-white"><ShieldCheck className="h-5 w-5" /></span>
              <div><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#155eef]">Your hiring trust</p><h2 className="mt-1 text-lg font-extrabold text-gray-900">Keep every role active and accountable.</h2><p className="mt-1 text-xs leading-5 text-gray-500">Reconfirm live roles and answer before each public deadline.</p></div>
            </div>
            <div className="bg-white/90 p-5"><p className="text-xs font-bold text-gray-500">Company response score</p><p className="mt-2 text-3xl font-extrabold tracking-tight text-emerald-600">96%</p><p className="mt-1 text-[0.7rem] text-gray-500">On-time candidate updates</p></div>
            <div className="bg-white/90 p-5"><p className="text-xs font-bold text-gray-500">Active commitments</p><p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">{counts.Active}</p><p className="mt-1 text-[0.7rem] text-gray-500">Verified roles currently hiring</p></div>
          </div>
        </section>

        {actionError && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError}
          </div>
        )}

        <FilterTabs
          tabs={tabList}
          active={activeFilter}
          onChange={(key) => setActiveFilter(key as 'All' | EmployerJobStatus)}
        />

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, location, salary..."
              className="w-full bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-[#014BAA] focus:ring-1 focus:ring-[#014BAA]/20 outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#F8F3F0] rounded-xl p-0.5 border border-gray-200">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-[#014BAA] shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="List view"
                aria-label="List view"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#014BAA] shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="pl-9 pr-8 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 outline-none focus:border-[#014BAA] appearance-none cursor-pointer"
              >
                <option value="recent">Sort by: Recent</option>
                <option value="applicants">Sort by: Applicants</option>
                <option value="views">Sort by: Views</option>
              </select>
            </div>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((job, i) => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="text-base font-bold text-gray-900">{job.title}</h3>
                        <StatusBadge status={job.status} size="sm" />
                        {job.verifiedEmployer && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[0.65rem] font-bold text-emerald-700"><BadgeCheck className="h-3.5 w-3.5" />Verified</span>}
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[0.65rem] font-bold text-[#155eef]"><ShieldCheck className="h-3.5 w-3.5" />{job.responseCommitmentDays}-day response</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {job.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {job.postedAt}
                        </span>
                        <span className="font-semibold text-emerald-700">{job.responseRate}% on-time responses</span>
                        <span>Hiring confirmed {job.hiringConfirmedAt.toLowerCase()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{job.applicants}</p>
                        <p className="text-[11px] text-gray-400 font-medium uppercase">Applicants</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{job.views}</p>
                        <p className="text-[11px] text-gray-400 font-medium uppercase">Views</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to="/applicants"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border border-gray-200 text-gray-600 hover:border-[#014BAA] hover:text-[#014BAA] transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        View Applicants
                      </Link>
                      <button
                        onClick={() => openEdit(job)}
                        aria-label={`Edit ${job.title}`}
                        title={`Edit ${job.title}`}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {job.status === 'Active' && (
                        <button
                          onClick={() => reconfirmHiring(job)}
                          aria-label={`Reconfirm hiring for ${job.title}`}
                          title="Reconfirm this role is still hiring"
                          className="p-2 text-gray-400 hover:bg-blue-50 hover:text-[#155eef] rounded-xl transition-colors"
                        >
                          <RefreshCcw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(job.id)}
                        aria-label={`Delete ${job.title}`}
                        title={`Delete ${job.title}`}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleStatus(job)}
                        aria-label={job.status === 'Active' ? `Close ${job.title}` : `Publish ${job.title}`}
                        title={job.status === 'Active' ? 'Close job post' : 'Publish job post'}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <EmptyState
                icon={Briefcase}
                title="No jobs found"
                description="Try adjusting your filters or search query."
                actionLabel="Post New Job"
                onAction={() => navigate('/post-job')}
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((job, i) => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <SpotlightCard className="h-full">
                    <div className="p-5 h-full flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <h3 className="text-base font-bold text-gray-900 truncate">{job.title}</h3>
                        <StatusBadge status={job.status} size="sm" />
                      </div>
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {job.verifiedEmployer && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[0.65rem] font-bold text-emerald-700"><BadgeCheck className="h-3.5 w-3.5" />Verified</span>}
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[0.65rem] font-bold text-[#155eef]"><ShieldCheck className="h-3.5 w-3.5" />{job.responseCommitmentDays} days</span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5" />
                          {job.salary}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {job.postedAt}
                        </div>
                        <div className="text-xs font-semibold text-emerald-700">{job.responseRate}% on-time · confirmed {job.hiringConfirmedAt.toLowerCase()}</div>
                      </div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-center flex-1">
                          <p className="text-xl font-bold text-gray-900">{job.applicants}</p>
                          <p className="text-[11px] text-gray-400 font-medium uppercase">Applicants</p>
                        </div>
                        <div className="w-px h-8 bg-gray-100" />
                        <div className="text-center flex-1">
                          <p className="text-xl font-bold text-gray-900">{job.views}</p>
                          <p className="text-[11px] text-gray-400 font-medium uppercase">Views</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-auto">
                        <MagneticButton
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border border-gray-200 text-gray-600 hover:border-[#014BAA] hover:text-[#014BAA] transition-colors"
                          onClick={() => { navigate('/applicants'); }}
                        >
                          <Users className="w-3.5 h-3.5" />
                          Applicants
                        </MagneticButton>
                        <button
                          onClick={() => openEdit(job)}
                          aria-label={`Edit ${job.title}`}
                          title={`Edit ${job.title}`}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          aria-label={`Delete ${job.title}`}
                          title={`Delete ${job.title}`}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <EmptyState
                icon={Briefcase}
                title="No jobs found"
                description="Try adjusting your filters or search query."
                actionLabel="Post New Job"
                onAction={() => navigate('/post-job')}
              />
            )}
          </div>
        )}
      </div>

      <AnimatedModal
        isOpen={Boolean(editingJob)}
        onClose={() => { setEditingJob(null); setActionError(''); }}
        title="Edit job post"
        size="sm"
      >
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Job title
            <input
              value={editForm.title}
              onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#014BAA] focus:ring-1 focus:ring-[#014BAA]/20"
              autoFocus
              required
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Location
            <input
              value={editForm.location}
              onChange={(event) => setEditForm((current) => ({ ...current, location: event.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#014BAA] focus:ring-1 focus:ring-[#014BAA]/20"
              required
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Salary
            <input
              value={editForm.salary}
              onChange={(event) => setEditForm((current) => ({ ...current, salary: event.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#014BAA] focus:ring-1 focus:ring-[#014BAA]/20"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Status
            <select
              value={editForm.status}
              onChange={(event) => setEditForm((current) => ({ ...current, status: event.target.value as EmployerJobStatus }))}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#014BAA]"
            >
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
            </select>
          </label>
          {actionError && <p role="alert" className="text-sm text-red-600">{actionError}</p>}
          <div className="flex justify-end gap-3 pt-1">
            <button onClick={() => { setEditingJob(null); setActionError(''); }} className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
              Cancel
            </button>
            <button onClick={saveEdit} className="rounded-xl bg-[#014BAA] px-4 py-2 text-sm font-semibold text-white hover:bg-[#013b86]">
              Save changes
            </button>
          </div>
        </div>
      </AnimatedModal>
    </div>
  );
}
