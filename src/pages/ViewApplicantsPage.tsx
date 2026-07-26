import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  BriefcaseBusiness,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  GraduationCap,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import UserAvatar from '../components/UserAvatar';
import DeadlineCountdown from '../components/DeadlineCountdown';
import EmptyState from '../components/employer/EmptyState';
import Breadcrumb from '../components/employer/Breadcrumb';
import { useStore } from '../store/StoreProvider';
import { ApplicantStatus, Application } from '../types';
import { getApplicantProfile } from '../data/applicantProfiles';

type FilterStatus = 'All' | ApplicantStatus;
type JobFilter = 'All' | string;

const PIPELINE_STATUSES: ApplicantStatus[] = [
  'Shortlisted',
  'Phone Screen',
  'Interview',
  'Offer',
  'Hired',
  'On Hold',
  'Rejected',
];

function statusClass(status: ApplicantStatus): string {
  switch (status) {
    case 'Shortlisted': return 'bg-blue-50 text-[#014BAA] border-blue-200';
    case 'Phone Screen': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 'Interview': return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'Offer': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Hired': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'On Hold': return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
    case 'Expired': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Viewed': return 'bg-[#F8F3F0] text-gray-700 border-gray-200';
    default: return 'bg-blue-50 text-blue-700 border-blue-200';
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ViewApplicantsPage() {
  const { applications, setApplicationStatus } = useStore();
  const [filter, setFilter] = useState<FilterStatus>('All');
  const [jobFilter, setJobFilter] = useState<JobFilter>('All');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  const employerApplications = useMemo(
    () => applications
      .filter((application) => application.companyId === 'company_1')
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()),
    [applications]
  );
  const jobs = useMemo(() => {
    const grouped = new Map<string, { id: string; title: string; count: number; awaiting: number }>();
    employerApplications.forEach((application) => {
      const current = grouped.get(application.jobId);
      grouped.set(application.jobId, {
        id: application.jobId,
        title: application.jobTitle,
        count: (current?.count || 0) + 1,
        awaiting: (current?.awaiting || 0) + (!application.employerResponded && application.status !== 'Expired' ? 1 : 0),
      });
    });
    return Array.from(grouped.values());
  }, [employerApplications]);

  const filteredApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return employerApplications.filter((application) => {
      const matchesFilter = filter === 'All' || application.status === filter;
      const matchesJob = jobFilter === 'All' || application.jobId === jobFilter;
      const matchesQuery = !normalizedQuery ||
        application.candidateName.toLowerCase().includes(normalizedQuery) ||
        application.candidateHeadline.toLowerCase().includes(normalizedQuery) ||
        application.jobTitle.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesJob && matchesQuery;
    });
  }, [employerApplications, filter, jobFilter, query]);

  useEffect(() => {
    if (filteredApplications.some((application) => application.id === selectedId)) return;
    setSelectedId(filteredApplications[0]?.id || null);
  }, [filteredApplications, selectedId]);

  const selected = employerApplications.find((application) => application.id === selectedId) || null;
  const selectedProfile = selected ? getApplicantProfile(selected) : null;

  const selectApplicant = (applicationId: string) => {
    setSelectedId(applicationId);
    window.requestAnimationFrame(() => {
      const details = detailsRef.current;
      if (!details) return;
      details.scrollTo({ top: 0, behavior: 'smooth' });
      details.scrollIntoView({ behavior: 'smooth', block: 'start' });
      details.focus({ preventScroll: true });
    });
  };

  const updateStage = (application: Application, status: ApplicantStatus) => {
    if (application.status === 'Expired') return;
    setApplicationStatus(application.id, status);
  };

  return (
    <div className="min-h-screen bg-[#F8F3F0]/80 -mx-4 -mt-6 -mb-12 px-4 pb-12 pt-6 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="sticky top-16 z-30 border-b border-gray-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Dashboard', path: '/employer' }, { label: 'Applicants' }]} />
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">Response Inbox</h1>
              <p className="mt-1 text-sm text-gray-500">Respond before the deadline to keep TechFlow’s JobX response score strong.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-56 flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search applicants"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#014BAA] focus:ring-1 focus:ring-[#014BAA]/20"
                />
              </div>
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value as FilterStatus)}
                  className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-7 text-sm font-medium text-gray-700 outline-none focus:border-[#014BAA]"
                  aria-label="Filter applicants by status"
                >
                  <option value="All">All statuses</option>
                  <option value="New">New</option>
                  <option value="Viewed">Viewed</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Phone Screen">Phone screen</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Hired">Hired</option>
                  <option value="On Hold">On hold</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm" aria-labelledby="roles-inbox-heading">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="roles-inbox-heading" className="text-sm font-bold text-gray-900">Inbox by job role</h2>
              <p className="mt-0.5 text-xs text-gray-500">Switch roles to manage each hiring pipeline separately.</p>
            </div>
            <span className="text-xs font-semibold text-gray-400">{jobs.length} active job pipeline{jobs.length === 1 ? '' : 's'}</span>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setJobFilter('All')}
              className={`shrink-0 rounded-xl border px-3 py-2 text-left transition-colors ${jobFilter === 'All' ? 'border-[#014BAA] bg-blue-50 text-[#014BAA]' : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200'}`}
            >
              <span className="block text-xs font-bold">All jobs</span>
              <span className="mt-0.5 block text-[10px] font-medium opacity-70">{employerApplications.length} candidates</span>
            </button>
            {jobs.map((job) => (
              <button
                type="button"
                key={job.id}
                onClick={() => setJobFilter(job.id)}
                className={`min-w-44 shrink-0 rounded-xl border px-3 py-2 text-left transition-colors ${jobFilter === job.id ? 'border-[#014BAA] bg-blue-50 text-[#014BAA]' : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200'}`}
              >
                <span className="block truncate text-xs font-bold">{job.title}</span>
                <span className="mt-0.5 flex items-center justify-between gap-3 text-[10px] font-medium opacity-70"><span>{job.count} candidates</span>{job.awaiting > 0 && <span>{job.awaiting} waiting</span>}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
          <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-bold text-gray-900">{jobFilter === 'All' ? 'All applicants' : jobs.find((job) => job.id === jobFilter)?.title}</h2>
              <p className="mt-0.5 text-xs text-gray-500">{filteredApplications.length} candidate{filteredApplications.length === 1 ? '' : 's'} in this view</p>
            </div>
            {filteredApplications.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={Users} title="No matching applicants" description="Try another search or status filter." />
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredApplications.map((application) => (
                  <button
                    key={application.id}
                    onClick={() => selectApplicant(application.id)}
                    aria-controls="applicant-details"
                    aria-pressed={selected?.id === application.id}
                    className={`group w-full border-l-2 px-5 py-4 text-left transition-all ${selected?.id === application.id ? 'border-l-[#014BAA] bg-blue-50/70' : 'border-l-transparent hover:bg-[#F8F3F0]/70'}`}
                  >
                    <div className="flex items-start gap-3">
                      <UserAvatar src={application.candidateAvatar} name={application.candidateName} size="sm" className="h-10 w-10 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="truncate text-sm font-semibold text-gray-900">{application.candidateName}</h3>
                          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusClass(application.status)}`}>{application.status}</span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-gray-500">{application.candidateHeadline}</p>
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                          <span>{application.jobTitle}</span>
                          <span className="inline-flex items-center gap-1 font-medium">
                            {application.matchScore}% match
                            <ChevronRight className={`h-3.5 w-3.5 transition-transform ${selected?.id === application.id ? 'translate-x-0.5 text-[#014BAA]' : 'group-hover:translate-x-0.5'}`} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            ref={detailsRef}
            id="applicant-details"
            tabIndex={-1}
            aria-label={selected ? `Applicant details for ${selected.candidateName}` : 'Applicant details'}
            className="scroll-mt-40 self-start overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[#014BAA]/30 lg:sticky lg:top-40 lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto"
          >
            {selected && selectedProfile ? (
              <div>
                <div className="border-b border-gray-100 bg-gradient-to-br from-blue-50/70 via-white to-[#F8F3F0]/60 p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#014BAA]">Applicant details</p>
                      <p className="mt-1 text-xs text-gray-500">Review the complete profile before responding.</p>
                    </div>
                    <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-bold ${statusClass(selected.status)}`}>{selected.status}</span>
                  </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar src={selected.candidateAvatar} name={selected.candidateName} size="lg" className="h-14 w-14" />
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{selected.candidateName}</h2>
                      <p className="text-sm text-gray-500">{selected.candidateHeadline}</p>
                    </div>
                  </div>
                  <Link to="/messages" className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-[#014BAA] transition-colors hover:bg-blue-50">
                    <Mail className="h-3.5 w-3.5" /> Message
                  </Link>
                </div>

                  <div className="mt-5 flex flex-wrap gap-2 text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5"><MapPin className="h-3.5 w-3.5 text-gray-400" /> {selectedProfile.location}</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5"><Clock className="h-3.5 w-3.5 text-gray-400" /> {selectedProfile.availability}</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5"><Mail className="h-3.5 w-3.5 text-gray-400" /> {selectedProfile.email}</span>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <section aria-labelledby="application-overview-heading">
                    <div className="flex items-center gap-2">
                      <BriefcaseBusiness className="h-4 w-4 text-[#014BAA]" />
                      <h3 id="application-overview-heading" className="text-sm font-bold text-gray-900">Application overview</h3>
                    </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-[#F8F3F0] p-3"><p className="text-xs text-gray-500">Applied for</p><p className="mt-1 text-sm font-semibold text-gray-900">{selected.jobTitle}</p></div>
                  <div className="rounded-xl bg-[#F8F3F0] p-3"><p className="text-xs text-gray-500">Applied</p><p className="mt-1 text-sm font-semibold text-gray-900">{formatDate(selected.appliedAt)}</p></div>
                  <div className="rounded-xl bg-[#F8F3F0] p-3">
                    <p className="text-xs text-gray-500">Skill match</p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{selected.matchScore}%</p>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-[#014BAA]" style={{ width: `${selected.matchScore}%` }} /></div>
                    </div>
                  </div>
                </div>
                  </section>

                  {selected.status === 'Expired' ? (
                    <div role="status" className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> This response window has expired and has been recorded in the employer response rate.
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-900">Candidate hiring stage</p>
                          <p className="mt-1 text-xs text-gray-500">Changing the stage sends this candidate a clear update.</p>
                        </div>
                        <select
                          value={PIPELINE_STATUSES.includes(selected.status) ? selected.status : ''}
                          onChange={(event) => updateStage(selected, event.target.value as ApplicantStatus)}
                          aria-label={`Change hiring stage for ${selected.candidateName}`}
                          className="min-w-44 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-[#014BAA] focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="" disabled>Choose stage</option>
                          {PIPELINE_STATUSES.map((status) => <option key={status} value={status}>{status === 'Rejected' ? 'Declined' : status}</option>)}
                        </select>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {PIPELINE_STATUSES.map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => updateStage(selected, status)}
                            aria-pressed={selected.status === status}
                            className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${selected.status === status ? statusClass(status) : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50/50'}`}
                          >
                            {status === 'Rejected' ? 'Decline' : status}
                          </button>
                        ))}
                      </div>
                      {selected.employerResponded && (
                        <div role="status" className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4 text-xs font-medium text-[#014BAA]">
                          <ShieldCheck className="h-4 w-4" /> Candidate notified {selected.respondedAt ? formatDate(selected.respondedAt) : ''}
                        </div>
                      )}
                    </div>
                  )}

                  <section className="mt-7 border-t border-gray-100 pt-6" aria-labelledby="candidate-summary-heading">
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-[#014BAA]" />
                      <h3 id="candidate-summary-heading" className="text-sm font-bold text-gray-900">Candidate summary</h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-gray-600">{selectedProfile.about}</p>
                  </section>

                  <section className="mt-7 border-t border-gray-100 pt-6" aria-labelledby="skills-heading">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4 text-[#014BAA]" />
                        <h3 id="skills-heading" className="text-sm font-bold text-gray-900">Skills & evidence</h3>
                      </div>
                      <span className="text-[11px] font-medium text-gray-400">Verified skills include proof</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedProfile.skills.map((skill) => (
                        <span key={skill.name} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${skill.verified ? 'border-blue-200 bg-blue-50 text-[#014BAA]' : 'border-gray-200 bg-white text-gray-600'}`}>
                          {skill.verified && <BadgeCheck className="h-3.5 w-3.5" />}
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </section>

                  <section className="mt-7 border-t border-gray-100 pt-6" aria-labelledby="proof-heading">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#014BAA]" />
                      <h3 id="proof-heading" className="text-sm font-bold text-gray-900">Proof of work</h3>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {selectedProfile.proofHighlights.map((proof) => (
                        <article key={proof.title} className="rounded-xl border border-gray-200 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/30">
                          <div className="flex items-start justify-between gap-3">
                            <span className="rounded-lg bg-blue-50 p-2 text-[#014BAA]"><ExternalLink className="h-4 w-4" /></span>
                            <span className="rounded-full bg-[#F8F3F0] px-2 py-1 text-[10px] font-bold text-gray-600">{proof.signal}</span>
                          </div>
                          <h4 className="mt-3 text-sm font-semibold text-gray-900">{proof.title}</h4>
                          <p className="mt-1.5 text-xs leading-5 text-gray-500">{proof.description}</p>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section className="mt-7 border-t border-gray-100 pt-6" aria-labelledby="experience-heading">
                    <div className="flex items-center gap-2">
                      <BriefcaseBusiness className="h-4 w-4 text-[#014BAA]" />
                      <h3 id="experience-heading" className="text-sm font-bold text-gray-900">Experience</h3>
                    </div>
                    <div className="mt-4 space-y-5 border-l border-blue-100 pl-5">
                      {selectedProfile.experience.map((experience) => (
                        <article key={`${experience.role}-${experience.company}`} className="relative">
                          <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#014BAA] ring-2 ring-blue-100" />
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900">{experience.role}</h4>
                              <p className="text-xs font-medium text-[#014BAA]">{experience.company}</p>
                            </div>
                            <span className="shrink-0 text-[11px] font-medium text-gray-400">{experience.period}</span>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-gray-500">{experience.achievement}</p>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section className="mt-7 border-t border-gray-100 pt-6" aria-labelledby="education-heading">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-[#014BAA]" />
                      <h3 id="education-heading" className="text-sm font-bold text-gray-900">Education</h3>
                    </div>
                    <div className="mt-4 rounded-xl border border-gray-200 p-4">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{selectedProfile.education.qualification}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{selectedProfile.education.school}</p>
                        </div>
                        <span className="shrink-0 text-[11px] font-medium text-gray-400">{selectedProfile.education.period}</span>
                      </div>
                    </div>
                  </section>

                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#014BAA]">JobX response commitment</p>
                      <p className="mt-1 text-xs text-blue-700">A clear response keeps candidates informed and protects your response score.</p>
                    </div>
                    <DeadlineCountdown deadline={selected.deadline} status={selected.status} employerResponded={selected.employerResponded} />
                  </div>
                </div>

                </div>
              </div>
            ) : (
              <div className="p-8"><EmptyState icon={Users} title="Select an applicant" description="Choose an applicant to review their response deadline and send an update." /></div>
            )}
          </div>
        </div>
        <Link to="/employer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#014BAA] hover:underline"><Clock className="h-4 w-4" /> Back to employer dashboard</Link>
      </div>
    </div>
  );
}
