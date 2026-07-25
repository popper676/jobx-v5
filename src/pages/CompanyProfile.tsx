import { ArrowLeft, ArrowRight, BadgeCheck, Building2, Clock3, Globe2, MapPin, ShieldCheck, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MOCK_JOBS } from '../data';
import { getJobTrustProfile, isTrustedJob } from '../services/trustService';

export default function CompanyProfile() {
  const { companyName = '' } = useParams();
  const company = decodeURIComponent(companyName);
  const jobs = MOCK_JOBS.filter((job) => job.company.toLowerCase() === company.toLowerCase());
  const primaryJob = jobs[0];

  if (!primaryJob) {
    return <div className="product-page py-12"><div className="product-shell max-w-5xl text-center"><Building2 className="mx-auto h-10 w-10 text-slate-300" /><h1 className="mt-4 text-2xl font-black text-slate-950">Company not found</h1><Link to="/jobs" className="mt-5 inline-flex items-center gap-2 font-bold text-[#155eef]"><ArrowLeft className="h-4 w-4" />Back to jobs</Link></div></div>;
  }

  const trust = getJobTrustProfile(primaryJob);
  const verified = isTrustedJob(primaryJob);
  const totalApplicants = jobs.reduce((total, job) => total + job.applicants, 0);
  const skills = [...new Set(jobs.flatMap((job) => job.skillsRequired))].slice(0, 8);

  return (
    <div className="product-page min-h-[calc(100vh-4rem)] py-7 sm:py-10">
      <div className="product-shell max-w-6xl">
        <Link to="/jobs" className="product-focus inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#155eef]"><ArrowLeft className="h-4 w-4" />Back to jobs</Link>

        <section className="relative mt-5 overflow-hidden rounded-[2rem] bg-[#12213a] p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.15)] sm:p-9">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#155eef]/40 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <span className={`relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.6rem] text-2xl font-black text-white shadow-xl ring-1 ring-white/20 ${primaryJob.logoColor}`}>
                <span className="absolute -right-5 -top-5 h-14 w-14 rounded-full bg-white/15" />{primaryJob.logoInitials}
                {verified && <BadgeCheck className="absolute bottom-3 right-3 h-5 w-5" />}
              </span>
              <div><p className="text-xs font-black uppercase tracking-[0.15em] text-blue-200">Company profile</p><h1 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-4xl">{primaryJob.company}</h1><p className="mt-2 text-sm font-semibold text-slate-300">{primaryJob.companyIndustry} · Response-aware employer</p></div>
            </div>
            {verified && <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/15 px-4 py-2 text-sm font-extrabold text-emerald-100"><ShieldCheck className="h-4 w-4" />Verified employer</span>}
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <Metric icon={<Clock3 className="h-5 w-5" />} label="Response trust" value={`${trust.responseRate}%`} detail={`${trust.medianResponseHours}h median response`} />
          <Metric icon={<Users className="h-5 w-5" />} label="JobX activity" value={`${trust.hiresOnJobX} hires`} detail={`${totalApplicants} current applicants`} />
          <Metric icon={<BadgeCheck className="h-5 w-5" />} label="Open opportunities" value={`${jobs.length}`} detail={`Replies within ${trust.responseCommitmentDays} days`} />
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <main className="space-y-6">
            <section className="product-surface p-6 sm:p-8"><p className="product-eyebrow">About the company</p><h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">Building teams through transparent hiring</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{primaryJob.companyOverview} The company uses JobX to connect with candidates through clear role expectations, visible salary information, and accountable response deadlines.</p><div className="mt-5 flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className="rounded-lg border border-blue-100 bg-[#eef4ff] px-3 py-1.5 text-xs font-bold text-[#0c3e9e]">{skill}</span>)}</div></section>

            <section><div className="flex items-end justify-between"><div><p className="product-eyebrow">Open roles</p><h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950">Jobs at {primaryJob.company}</h2></div></div><div className="mt-4 space-y-3">{jobs.map((job) => <Link key={job.id} to={`/jobs/${job.id}`} className="product-surface product-card-interactive flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-lg font-black text-slate-900">{job.title}</h3><p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500"><MapPin className="h-4 w-4 text-[#155eef]" />{job.location} · {job.workplaceType}<span>·</span>{job.type}</p></div><span className="inline-flex items-center gap-1.5 self-start text-sm font-extrabold text-[#155eef] sm:self-auto">View role <ArrowRight className="h-4 w-4" /></span></Link>)}</div></section>
          </main>

          <aside className="space-y-4">
            <section className="product-surface p-5"><h2 className="font-black text-slate-900">Company information</h2><div className="mt-4 space-y-4 text-sm font-semibold text-slate-600"><p className="flex items-center gap-3"><Building2 className="h-4 w-4 text-[#155eef]" />{primaryJob.companyIndustry}</p><p className="flex items-center gap-3"><Users className="h-4 w-4 text-[#155eef]" />{primaryJob.companySize}</p><p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[#155eef]" />{primaryJob.location}</p><p className="flex items-center gap-3"><Globe2 className="h-4 w-4 text-[#155eef]" />Founded {primaryJob.companyFounded}</p></div></section>
            <section className="rounded-2xl bg-[#eef4ff] p-5"><ShieldCheck className="h-5 w-5 text-[#155eef]" /><h2 className="mt-3 font-black text-slate-900">Response accountability</h2><p className="mt-2 text-sm leading-6 text-slate-600">Missed deadlines reduce this employer’s verification score, helping candidates make informed decisions.</p></section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) {
  return <article className="product-surface flex items-center gap-4 p-5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef4ff] text-[#155eef]">{icon}</span><div><p className="text-xl font-black text-slate-950">{value}</p><p className="text-xs font-extrabold text-slate-700">{label}</p><p className="mt-0.5 text-[0.7rem] font-semibold text-slate-400">{detail}</p></div></article>;
}
