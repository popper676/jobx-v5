import { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Award, BadgeCheck, BookOpen, BriefcaseBusiness, Check, FileText, FolderGit2,
  GraduationCap, Link2, Mail, MapPin, Pencil, Plus, Save, Sparkles, Upload, UserRound, X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import UserAvatar from '../components/UserAvatar';
import { useStore } from '../store/StoreProvider';
import { projectService } from '../services/projectService';
import { proofService } from '../services/proofService';
import { formatResumeFileSize, validateResumeFile } from '../services/resumeUploadService';

type Education = { school: string; qualification: string; period: string };
type DraftExperience = { role: string; company: string; period: string; duration: string; description: string };

const EDUCATION_KEY = 'candidate_profile_education';
const RESUME_KEY = 'candidate_profile_resume';
const defaultEducation: Education[] = [
  { school: 'University of Technology', qualification: 'BSc, Computer Science', period: '2020 – 2024' },
];

function readLocal<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function SectionHeader({ icon: Icon, title, subtitle, editing, onEdit }: {
  icon: typeof UserRound; title: string; subtitle: string; editing?: boolean; onEdit?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf3fb] text-[#173b67]"><Icon className="h-5 w-5" /></span>
        <div><h2 className="font-black text-slate-950">{title}</h2><p className="mt-0.5 text-xs leading-5 text-slate-500">{subtitle}</p></div>
      </div>
      {onEdit && <button type="button" onClick={onEdit} className="product-focus inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-[#173b67] hover:bg-slate-50">{editing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}{editing ? 'Cancel' : 'Edit'}</button>}
    </div>
  );
}

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#155eef] focus:ring-4 focus:ring-blue-100';

export default function Dashboard() {
  const store = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const [resume, setResume] = useState<{ name: string; size: number } | null>(() => readLocal(RESUME_KEY, null));
  const [education, setEducation] = useState<Education[]>(() => readLocal(EDUCATION_KEY, defaultEducation));
  const [draft, setDraft] = useState({
    name: store.user.name,
    title: store.user.title,
    email: store.user.email,
    location: store.user.location,
    website: store.user.website,
    bio: store.user.bio,
    skills: store.user.skills.map((item) => item.skill).join(', '),
    experience: store.user.experience.map((item) => ({ ...item })) as DraftExperience[],
  });

  const projects = useMemo(() => projectService.getAllProjects(store.user).filter((project) => project.myProject), [store.user]);
  const certificates = proofService.getProgress().certificates;
  const completedSections = [
    Boolean(store.user.name && store.user.title && store.user.location),
    Boolean(store.user.bio),
    Boolean(store.user.experience.length),
    Boolean(education.length),
    Boolean(store.user.skills.length),
    Boolean(resume),
  ].filter(Boolean).length;
  const completion = Math.round((completedSections / 6) * 100);

  const saveProfile = () => {
    const skills = draft.skills.split(',').map((skill) => skill.trim()).filter(Boolean);
    store.updateUser({
      name: draft.name.trim(), title: draft.title.trim(), email: draft.email.trim(),
      location: draft.location.trim(), website: draft.website.trim(), bio: draft.bio.trim(),
      skills: skills.map((skill) => ({ skill, endorsements: store.user.skills.find((item) => item.skill.toLowerCase() === skill.toLowerCase())?.endorsements || 0 })),
      experience: draft.experience.filter((item) => item.role.trim() || item.company.trim()),
    });
    localStorage.setItem(EDUCATION_KEY, JSON.stringify(education));
    setEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const handleResume = (file?: File) => {
    if (!file) return;
    const error = validateResumeFile(file);
    if (error) { setResumeError(error); return; }
    const value = { name: file.name, size: file.size };
    setResume(value);
    localStorage.setItem(RESUME_KEY, JSON.stringify(value));
    setResumeError('');
  };

  return (
    <div className="w-full pb-10">
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative isolate overflow-hidden rounded-[2rem] bg-[#12213a] p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:p-8">
        <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#155eef]/40 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#ffdae7]/15 blur-3xl" />
        <div className="relative grid gap-7 lg:grid-cols-[1fr_18rem] lg:items-center">
          <div className="flex items-start gap-5">
            <UserAvatar src={store.user.avatar} name={store.user.name} size="lg" className="h-24 w-24 border-4 border-white/20 shadow-xl" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b7ff3c]">Candidate career profile</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-4xl">{store.user.name}</h1>
              <p className="mt-1 text-base font-bold text-blue-200">{store.user.title}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-300">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{store.user.location || 'Add location'}</span>
                <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{store.user.email}</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur">
            <div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-wider text-blue-200">Profile readiness</span><strong className="text-2xl">{completion}%</strong></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#b7ff3c]" style={{ width: `${completion}%` }} /></div>
            <p className="mt-3 text-xs leading-5 text-slate-300">{completedSections} of 6 essential profile sections are ready for employers.</p>
            <button type="button" onClick={() => setEditing(true)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-[#12213a]"><Pencil className="h-4 w-4" /> Edit candidate profile</button>
          </div>
        </div>
      </motion.section>

      {saved && <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800"><Check className="h-4 w-4" />Your candidate profile has been saved.</div>}

      <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(19rem,.75fr)]">
        <div className="space-y-4">
          <article className="product-surface overflow-hidden">
            <SectionHeader icon={UserRound} title="Profile & bio" subtitle="The professional introduction employers see first." editing={editing} onEdit={() => setEditing((value) => !value)} />
            <div className="p-5 sm:p-6">
              {editing ? <div className="grid gap-4 sm:grid-cols-2">
                <input aria-label="Full name" className={fieldClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Full name" />
                <input aria-label="Professional title" className={fieldClass} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Professional title" />
                <input aria-label="Email" className={fieldClass} value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="Email address" />
                <input aria-label="Location" className={fieldClass} value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="City, country" />
                <input aria-label="Website" className={`${fieldClass} sm:col-span-2`} value={draft.website} onChange={(e) => setDraft({ ...draft, website: e.target.value })} placeholder="Portfolio or LinkedIn URL" />
                <textarea aria-label="Professional bio" rows={5} className={`${fieldClass} sm:col-span-2`} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} placeholder="Write a focused professional bio…" />
              </div> : <p className="text-sm leading-7 text-slate-600">{store.user.bio || 'Add a concise bio explaining your experience, strengths, and the work you want to do next.'}</p>}
            </div>
          </article>

          <article className="product-surface overflow-hidden">
            <SectionHeader icon={BriefcaseBusiness} title="Experience" subtitle="Roles, responsibilities, and measurable outcomes." />
            <div className="divide-y divide-slate-100">
              {(editing ? draft.experience : store.user.experience).map((item, index) => <div key={`${item.company}-${index}`} className="p-5 sm:p-6">
                {editing ? <div className="grid gap-3 sm:grid-cols-2">
                  {(['role', 'company', 'period', 'duration'] as const).map((key) => <input key={key} aria-label={`Experience ${key}`} className={fieldClass} value={item[key]} placeholder={key[0].toUpperCase() + key.slice(1)} onChange={(e) => setDraft({ ...draft, experience: draft.experience.map((entry, entryIndex) => entryIndex === index ? { ...entry, [key]: e.target.value } : entry) })} />)}
                  <textarea aria-label="Experience description" className={`${fieldClass} sm:col-span-2`} rows={3} value={item.description} placeholder="Responsibilities and measurable outcomes" onChange={(e) => setDraft({ ...draft, experience: draft.experience.map((entry, entryIndex) => entryIndex === index ? { ...entry, description: e.target.value } : entry) })} />
                </div> : <><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-black text-slate-900">{item.role}</h3><p className="mt-1 text-sm font-bold text-[#173b67]">{item.company}</p></div><span className="text-xs font-bold text-slate-400">{item.period || item.duration}</span></div><p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p></>}
              </div>)}
              {editing && <div className="p-5"><button type="button" onClick={() => setDraft({ ...draft, experience: [...draft.experience, { role: '', company: '', period: '', duration: '', description: '' }] })} className="inline-flex items-center gap-2 text-sm font-black text-[#155eef]"><Plus className="h-4 w-4" />Add experience</button></div>}
              {!editing && !store.user.experience.length && <p className="p-6 text-sm text-slate-500">No experience added yet. Select Edit candidate profile to add your first role.</p>}
            </div>
          </article>

          <article className="product-surface overflow-hidden">
            <SectionHeader icon={GraduationCap} title="Education" subtitle="Degrees, courses, and professional learning." />
            <div className="divide-y divide-slate-100">
              {education.map((item, index) => <div key={`${item.school}-${index}`} className="p-5 sm:p-6">
                {editing ? <div className="grid gap-3 sm:grid-cols-3">{(['school', 'qualification', 'period'] as const).map((key) => <input key={key} aria-label={`Education ${key}`} className={fieldClass} value={item[key]} placeholder={key[0].toUpperCase() + key.slice(1)} onChange={(e) => setEducation(education.map((entry, entryIndex) => entryIndex === index ? { ...entry, [key]: e.target.value } : entry))} />)}</div>
                  : <div className="flex flex-wrap justify-between gap-2"><div><h3 className="font-black text-slate-900">{item.qualification}</h3><p className="mt-1 text-sm font-bold text-[#173b67]">{item.school}</p></div><span className="text-xs font-bold text-slate-400">{item.period}</span></div>}
              </div>)}
              {editing && <div className="p-5"><button type="button" onClick={() => setEducation([...education, { school: '', qualification: '', period: '' }])} className="inline-flex items-center gap-2 text-sm font-black text-[#155eef]"><Plus className="h-4 w-4" />Add education</button></div>}
            </div>
          </article>
        </div>

        <aside className="space-y-4">
          <article className="product-surface overflow-hidden">
            <SectionHeader icon={FileText} title="Candidate CV" subtitle="Your primary employer-ready document." />
            <div className="p-5">
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => handleResume(e.target.files?.[0])} />
              {resume ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex gap-3"><BadgeCheck className="h-5 w-5 shrink-0 text-emerald-700" /><div className="min-w-0"><p className="truncate text-sm font-black text-slate-900">{resume.name}</p><p className="mt-1 text-xs text-slate-500">{formatResumeFileSize(resume.size)} · Ready to use</p></div></div></div> : <div className="rounded-xl border-2 border-dashed border-slate-200 p-5 text-center"><Upload className="mx-auto h-6 w-6 text-[#155eef]" /><p className="mt-2 text-sm font-black text-slate-800">Upload your CV</p><p className="mt-1 text-xs text-slate-400">PDF, DOC, DOCX or TXT · Max 5 MB</p></div>}
              {resumeError && <p className="mt-2 text-xs font-bold text-red-600">{resumeError}</p>}
              <button type="button" onClick={() => fileRef.current?.click()} className="mt-3 w-full rounded-xl bg-[#173b67] px-4 py-2.5 text-sm font-black text-white">{resume ? 'Replace CV' : 'Choose CV file'}</button>
              <Link to="/resume" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-[#173b67]"><Sparkles className="h-4 w-4" />Open CV builder</Link>
            </div>
          </article>

          <article className="product-surface overflow-hidden">
            <SectionHeader icon={Award} title="Skills" subtitle="Capabilities visible to employers." />
            <div className="p-5">
              {editing ? <textarea aria-label="Skills" className={fieldClass} rows={4} value={draft.skills} onChange={(e) => setDraft({ ...draft, skills: e.target.value })} placeholder="React, TypeScript, Product Design…" /> : <div className="flex flex-wrap gap-2">{store.user.skills.length ? store.user.skills.map((item) => <span key={item.skill} className="rounded-lg bg-[#edf3fb] px-3 py-2 text-xs font-black text-[#173b67]">{item.skill}</span>) : <p className="text-sm text-slate-500">Add the skills you want employers to find.</p>}</div>}
            </div>
          </article>

          <article className="product-surface overflow-hidden">
            <SectionHeader icon={FolderGit2} title="Projects" subtitle="Work samples and collaboration evidence." />
            <div className="p-5">
              {projects.slice(0, 3).map((project) => <Link key={project.id} to={`/projects/${project.id}`} className="mb-3 block rounded-xl border border-slate-100 p-3 last:mb-0 hover:border-blue-200"><p className="text-sm font-black text-slate-900">{project.title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{project.description}</p></Link>)}
              <Link to="/projects" className="mt-3 inline-flex items-center gap-1.5 text-sm font-black text-[#155eef]"><Plus className="h-4 w-4" />Add or manage projects</Link>
            </div>
          </article>

          <article className="product-surface overflow-hidden">
            <SectionHeader icon={BookOpen} title="Certificates" subtitle="Verified credentials and completed missions." />
            <div className="p-5">
              {certificates.length ? certificates.map((certificate) => <div key={certificate.id} className="mb-3 rounded-xl border border-slate-100 p-3 last:mb-0"><p className="text-sm font-black text-slate-900">{certificate.title}</p><p className="mt-1 text-xs font-bold text-emerald-700">{certificate.employer} · +{certificate.points} proof points</p></div>) : <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Complete an employer mission to add a verified certificate here.</div>}
              <Link to="/projects" className="mt-3 inline-flex items-center gap-1.5 text-sm font-black text-[#155eef]"><Award className="h-4 w-4" />Explore verification</Link>
            </div>
          </article>
        </aside>
      </section>

      {editing && <div className="sticky bottom-4 z-20 mt-5 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur"><p className="hidden text-sm font-bold text-slate-600 sm:block">Review your candidate information before saving.</p><div className="ml-auto flex gap-2"><button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-600">Cancel</button><button type="button" onClick={saveProfile} className="inline-flex items-center gap-2 rounded-xl bg-[#173b67] px-5 py-2.5 text-sm font-black text-white"><Save className="h-4 w-4" />Save profile</button></div></div>}
    </div>
  );
}
