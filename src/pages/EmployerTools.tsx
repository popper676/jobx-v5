import type { ReactNode } from 'react';
import { ArrowLeft, BarChart3, BriefcaseBusiness, Folder, Mail, Trophy, Users, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

const tools = [
  { icon: <BriefcaseBusiness />, title: 'My jobs', detail: 'Manage active, draft, and closed roles', href: '/my-posts' },
  { icon: <Folder />, title: 'Candidate folders', detail: 'Search the applicant database by role', href: '/employer/candidates' },
  { icon: <Mail />, title: 'Messages', detail: 'Role-aware candidate conversations', href: '/messages' },
  { icon: <Video />, title: 'Interview center', detail: 'Accepted applicants, scheduling, and role conversations', href: '/employer/interviews' },
  { icon: <BarChart3 />, title: 'Activity rates', detail: 'Credit rates grouped by recruiting activity', href: '/employer/rates' },
  { icon: <BarChart3 />, title: 'Hiring analysis', detail: 'Pipeline, conversion, and role performance', href: '/employer/analytics' },
  { icon: <Trophy />, title: 'Challenges & hackathons', detail: 'Post proof-first candidate activities', href: '/employer/challenges' },
];

export default function EmployerTools() {
  return <main className="product-page -mx-4 min-h-[calc(100vh-4rem)] px-4 py-7 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"><div className="product-shell max-w-7xl">
    <Link to="/employer" className="product-button-secondary"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
    <header className="mt-6 border-b border-slate-200 pb-7"><p className="product-eyebrow">Employer workspace</p><h1 className="product-title mt-3 text-4xl font-black">Employer tools</h1><p className="product-copy mt-2">Open a focused hiring workspace without duplicated search or company-profile controls.</p></header>
    <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{tools.map((tool) => <div key={tool.title}><Tool icon={tool.icon} title={tool.title} detail={tool.detail} href={tool.href} /></div>)}</section>
  </div></main>;
}

function Tool({ icon, title, detail, href }: { icon: ReactNode; title: string; detail: string; href: string }) {
  return <Link to={href} className="product-surface product-card-interactive flex min-h-32 items-start gap-4 p-5"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf2f7] text-[#173b67] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><span><strong className="block text-base text-slate-900">{title}</strong><small className="mt-2 block text-sm leading-5 text-slate-500">{detail}</small></span></Link>;
}
