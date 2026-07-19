import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Filter, Search, ShieldCheck, Users, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserAvatar from '../components/UserAvatar';
import DeadlineCountdown from '../components/DeadlineCountdown';
import CompanyResponseRate from '../components/CompanyResponseRate';
import EmptyState from '../components/employer/EmptyState';
import Breadcrumb from '../components/employer/Breadcrumb';
import { useStore } from '../store/StoreProvider';
import { antiGhostingService } from '../services/antiGhostingService';
import { ApplicantStatus, Application } from '../types';

type FilterStatus = 'All' | ApplicantStatus;

function statusClass(status: ApplicantStatus): string {
  switch (status) {
    case 'Shortlisted': return 'bg-blue-50 text-[#014BAA] border-blue-200';
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
  const { applications, respondToApplication } = useStore();
  const [filter, setFilter] = useState<FilterStatus>('All');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const employerApplications = useMemo(
    () => applications
      .filter((application) => application.companyId === 'company_1')
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()),
    [applications]
  );
  const responseRate = antiGhostingService.getCompanyResponseRate('company_1');

  const filteredApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return employerApplications.filter((application) => {
      const matchesFilter = filter === 'All' || application.status === filter;
      const matchesQuery = !normalizedQuery ||
        application.candidateName.toLowerCase().includes(normalizedQuery) ||
        application.candidateHeadline.toLowerCase().includes(normalizedQuery) ||
        application.jobTitle.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [employerApplications, filter, query]);

  useEffect(() => {
    if (filteredApplications.some((application) => application.id === selectedId)) return;
    setSelectedId(filteredApplications[0]?.id || null);
  }, [filteredApplications, selectedId]);

  const selected = employerApplications.find((application) => application.id === selectedId) || null;
  const awaitingResponse = employerApplications.filter((application) => !application.employerResponded && application.status !== 'Expired').length;

  const respond = (application: Application, decision: 'accepted' | 'rejected') => {
    if (application.employerResponded || application.status === 'Expired') return;
    respondToApplication(application.id, decision);
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
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Applications</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{employerApplications.length}</p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#014BAA]">Needs response</p>
            <p className="mt-1 text-2xl font-bold text-[#014BAA]">{awaitingResponse}</p>
          </div>
          <CompanyResponseRate rate={responseRate} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
          <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-bold text-gray-900">Applicants</h2>
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
                    onClick={() => setSelectedId(application.id)}
                    className={`w-full px-5 py-4 text-left transition-colors ${selected?.id === application.id ? 'bg-blue-50/60' : 'hover:bg-[#F8F3F0]/70'}`}
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
                          <span>{application.matchScore}% match</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm">
            {selected ? (
              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar src={selected.candidateAvatar} name={selected.candidateName} size="lg" className="h-14 w-14" />
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{selected.candidateName}</h2>
                      <p className="text-sm text-gray-500">{selected.candidateHeadline}</p>
                    </div>
                  </div>
                  <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-bold ${statusClass(selected.status)}`}>{selected.status}</span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-[#F8F3F0] p-3"><p className="text-xs text-gray-500">Applied for</p><p className="mt-1 text-sm font-semibold text-gray-900">{selected.jobTitle}</p></div>
                  <div className="rounded-xl bg-[#F8F3F0] p-3"><p className="text-xs text-gray-500">Applied</p><p className="mt-1 text-sm font-semibold text-gray-900">{formatDate(selected.appliedAt)}</p></div>
                  <div className="rounded-xl bg-[#F8F3F0] p-3"><p className="text-xs text-gray-500">Skill match</p><p className="mt-1 text-sm font-semibold text-gray-900">{selected.matchScore}%</p></div>
                </div>

                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#014BAA]">JobX response commitment</p>
                      <p className="mt-1 text-xs text-blue-700">A clear response keeps candidates informed and protects your response score.</p>
                    </div>
                    <DeadlineCountdown deadline={selected.deadline} status={selected.status} employerResponded={selected.employerResponded} />
                  </div>
                </div>

                {selected.status === 'Expired' ? (
                  <div role="status" className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> This response window has expired and has been recorded in the employer response rate.
                  </div>
                ) : selected.employerResponded ? (
                  <div role="status" className="mt-5 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-[#014BAA]">
                    <ShieldCheck className="h-4 w-4" /> Candidate notified {selected.respondedAt ? formatDate(selected.respondedAt) : ''}
                  </div>
                ) : (
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button onClick={() => respond(selected, 'accepted')} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#014BAA] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#013b86]">
                      <CheckCircle2 className="h-4 w-4" /> Shortlist candidate
                    </button>
                    <button onClick={() => respond(selected, 'rejected')} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                      <XCircle className="h-4 w-4" /> Send decline update
                    </button>
                  </div>
                )}
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
