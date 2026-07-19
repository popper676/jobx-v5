import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ClipboardCopy,
  FileCheck2,
  ListChecks,
  PenLine,
  Plus,
  Route,
  Save,
  Trash2,
} from 'lucide-react';
import { db } from '../services/db';
import {
  analyzeResume,
  createAchievementTemplate,
  type ResumeExperience,
  type ResumePersonal,
} from '../services/resumeIntelligenceService';
import { useStore } from '../store/StoreProvider';
import JobXIconTile from '../components/JobXIconTile';

const EMPTY_PERSONAL: ResumePersonal = { name: '', email: '', phone: '', title: '' };
const EMPTY_EXPERIENCE: ResumeExperience = { id: 1, company: '', role: '', description: '' };

function getInitialExperience(): ResumeExperience[] {
  const stored = db.get<unknown>('resume_experience', [EMPTY_EXPERIENCE]);
  if (!Array.isArray(stored) || !stored.length) return [EMPTY_EXPERIENCE];
  return stored.map((item, index) => {
    const candidate = item as Partial<ResumeExperience>;
    return {
      id: typeof candidate.id === 'number' ? candidate.id : index + 1,
      company: typeof candidate.company === 'string' ? candidate.company : '',
      role: typeof candidate.role === 'string' ? candidate.role : '',
      description: typeof candidate.description === 'string' ? candidate.description : '',
    };
  });
}

export default function ResumeBuilder() {
  const store = useStore();
  const [personalInfo, setPersonalInfo] = useState<ResumePersonal>(() => {
    const stored = db.get<Partial<ResumePersonal> | null>('resume_personal', null);
    return {
      name: stored?.name || store.user.name || EMPTY_PERSONAL.name,
      email: stored?.email || store.user.email || EMPTY_PERSONAL.email,
      phone: stored?.phone || EMPTY_PERSONAL.phone,
      title: stored?.title || store.user.title || EMPTY_PERSONAL.title,
    };
  });
  const [experience, setExperience] = useState<ResumeExperience[]>(getInitialExperience);
  const [selectedExperienceId, setSelectedExperienceId] = useState<number>(experience[0]?.id ?? EMPTY_EXPERIENCE.id);
  const [saveNotice, setSaveNotice] = useState<'saved' | 'error' | null>(null);
  const [copied, setCopied] = useState(false);

  const updatePersonalInfo = useCallback((next: ResumePersonal) => {
    setPersonalInfo(next);
    db.set('resume_personal', next);
  }, []);

  const updateExperience = useCallback((next: ResumeExperience[]) => {
    setExperience(next);
    db.set('resume_experience', next);
  }, []);

  const updateExperienceField = (id: number, field: keyof Omit<ResumeExperience, 'id'>, value: string) => {
    updateExperience(experience.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };

  const addExperience = () => {
    const next = [...experience, { ...EMPTY_EXPERIENCE, id: Date.now() }];
    updateExperience(next);
    setSelectedExperienceId(next[next.length - 1].id);
  };

  const removeExperience = (id: number) => {
    if (experience.length <= 1) return;
    const next = experience.filter((item) => item.id !== id);
    updateExperience(next);
    if (selectedExperienceId === id) setSelectedExperienceId(next[0].id);
  };

  const handleSave = () => {
    const personalResult = db.set('resume_personal', personalInfo);
    const experienceResult = db.set('resume_experience', experience);
    setSaveNotice(personalResult.ok && experienceResult.ok ? 'saved' : 'error');
  };

  const useProfileDetails = () => {
    updatePersonalInfo({
      name: store.user.name || personalInfo.name,
      email: store.user.email || personalInfo.email,
      phone: personalInfo.phone,
      title: store.user.title || personalInfo.title,
    });
  };

  const analysis = useMemo(() => analyzeResume(personalInfo, experience), [personalInfo, experience]);
  const selectedExperience = experience.find((item) => item.id === selectedExperienceId) ?? experience[0] ?? EMPTY_EXPERIENCE;
  const achievementTemplate = useMemo(
    () => createAchievementTemplate(selectedExperience.description, selectedExperience.role),
    [selectedExperience.description, selectedExperience.role],
  );

  const copyTemplate = async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(achievementTemplate);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="product-page mx-auto w-full max-w-7xl py-2 sm:py-4">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-7 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3.5">
          <JobXIconTile icon={FileCheck2} size="lg" />
          <div>
            <p className="product-eyebrow">Career evidence workspace</p>
            <h1 className="product-title mt-2 text-3xl sm:text-4xl">Resume Builder</h1>
            <p className="product-copy mt-2 text-sm sm:text-base">Build a focused resume, then strengthen its evidence before you apply.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/career-coach" className="product-button-secondary product-focus px-4"><Route className="h-4 w-4" /> Career Coach</Link>
          <button type="button" onClick={handleSave} className="product-button-primary product-focus px-5"><Save className="h-4 w-4" /> Save resume</button>
        </div>
      </div>

      {saveNotice && (
        <div role="status" className={`mt-5 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${saveNotice === 'saved' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200' : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200'}`}>
          {saveNotice === 'saved' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {saveNotice === 'saved' ? 'Resume saved to this device.' : 'We could not save your resume. Please try again.'}
        </div>
      )}

      <section className="product-surface mt-6 overflow-hidden p-5 sm:p-6" aria-labelledby="resume-review-title">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Resume review</p>
            <h2 id="resume-review-title" className="mt-1 text-lg font-bold tracking-[-0.025em] text-slate-900 dark:text-white">Make your evidence easier to trust</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">Review the details you enter here for clarity and relevance. Your resume is never filled with made-up employers, tools, or outcomes.</p>
          </div>
          <div className="self-start text-left lg:text-right">
            <p className="text-xl font-bold tracking-[-0.04em] text-slate-900 dark:text-white">{analysis.score}%</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{analysis.label}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div>
            <p className="text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">{analysis.summary}</p>
            {analysis.suggestions.length > 0 ? (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {analysis.suggestions.map((suggestion) => <li key={suggestion.id} className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white px-3 py-3 text-sm dark:border-slate-800 dark:bg-slate-900"><ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-[#155eef]" /><span><strong className="block text-slate-800 dark:text-slate-100">{suggestion.title}</strong><span className="mt-0.5 block text-xs leading-5 text-slate-500 dark:text-slate-400">{suggestion.detail}</span></span></li>)}
              </ul>
            ) : (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"><CheckCircle2 className="h-4 w-4" />Your resume has a clear baseline. Tailor one result to the role you want next.</div>
            )}
          </div>
          <button type="button" onClick={useProfileDetails} className="product-button-secondary product-focus whitespace-nowrap px-4"><FileCheck2 className="h-4 w-4" /> Use profile details</button>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:items-start">
        <div className="space-y-5">
          <section className="product-surface p-5 sm:p-6" aria-labelledby="personal-info-title">
            <h2 id="personal-info-title" className="text-lg font-extrabold tracking-[-0.03em] text-slate-900 dark:text-white">Personal information</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className="product-field-label">Full name</span><input value={personalInfo.name} onChange={(event) => updatePersonalInfo({ ...personalInfo, name: event.target.value })} className="product-input" placeholder="Your name" /></label>
              <label><span className="product-field-label">Professional title</span><input value={personalInfo.title} onChange={(event) => updatePersonalInfo({ ...personalInfo, title: event.target.value })} className="product-input" placeholder="e.g. Product designer" /></label>
              <label><span className="product-field-label">Contact email</span><input type="email" value={personalInfo.email} onChange={(event) => updatePersonalInfo({ ...personalInfo, email: event.target.value })} className="product-input" placeholder="you@example.com" /></label>
              <label><span className="product-field-label">Phone <span className="font-medium normal-case tracking-normal text-slate-400">(optional)</span></span><input type="tel" value={personalInfo.phone} onChange={(event) => updatePersonalInfo({ ...personalInfo, phone: event.target.value })} className="product-input" placeholder="Your phone number" /></label>
            </div>
          </section>

          <section className="product-surface p-5 sm:p-6" aria-labelledby="experience-title">
            <div className="flex items-center justify-between gap-3"><div><h2 id="experience-title" className="text-lg font-extrabold tracking-[-0.03em] text-slate-900 dark:text-white">Experience evidence</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Use concrete responsibilities and real outcomes.</p></div><button type="button" onClick={addExperience} className="product-button-secondary product-focus px-3"><Plus className="h-4 w-4" /> Add role</button></div>
            <div className="mt-5 space-y-4">
              {experience.map((item, index) => {
                const selected = item.id === selectedExperienceId;
                return <article key={item.id} className={`rounded-2xl border p-4 transition-colors ${selected ? 'border-blue-200 bg-[#eef4ff]/45 dark:border-blue-900/70 dark:bg-blue-950/25' : 'border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/50'}`}>
                  <div className="flex items-center justify-between gap-3"><p className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">Role {index + 1}</p>{experience.length > 1 && <button type="button" onClick={() => removeExperience(item.id)} aria-label={`Remove role ${index + 1}`} className="product-focus rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"><Trash2 className="h-4 w-4" /></button>}</div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label><span className="product-field-label">Company</span><input value={item.company} onChange={(event) => updateExperienceField(item.id, 'company', event.target.value)} className="product-input" placeholder="Company name" /></label>
                    <label><span className="product-field-label">Role</span><input value={item.role} onChange={(event) => updateExperienceField(item.id, 'role', event.target.value)} className="product-input" placeholder="Role title" /></label>
                    <label className="sm:col-span-2"><span className="product-field-label">Achievement or responsibility</span><textarea rows={4} value={item.description} onChange={(event) => updateExperienceField(item.id, 'description', event.target.value)} className="product-input resize-y" placeholder="Describe work you actually delivered and the result, if known." /></label>
                  </div>
                  <button type="button" onClick={() => setSelectedExperienceId(item.id)} className={`product-focus mt-4 inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-extrabold transition-colors ${selected ? 'bg-white text-[#0c3e9e] shadow-sm dark:bg-slate-900 dark:text-blue-200' : 'text-[#155eef] hover:bg-white dark:hover:bg-slate-900'}`}><PenLine className="h-3.5 w-3.5" />{selected ? 'Showing bullet guidance' : 'Get bullet guidance'}</button>
                </article>;
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-20">
          <section className="product-surface overflow-hidden p-6 sm:p-7" aria-labelledby="resume-preview-title">
            <div className="border-b-2 border-slate-900 pb-5 text-center dark:border-white"><h2 id="resume-preview-title" className="text-2xl font-extrabold tracking-[-0.04em] text-slate-900 dark:text-white">{personalInfo.name || 'Your name'}</h2><p className="mt-1 text-base font-medium text-slate-600 dark:text-slate-300">{personalInfo.title || 'Professional title'}</p><div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">{personalInfo.email && <span>{personalInfo.email}</span>}{personalInfo.phone && <span>{personalInfo.phone}</span>}</div></div>
            <div className="mt-6"><h3 className="border-b border-slate-200 pb-2 text-sm font-extrabold uppercase tracking-[0.1em] text-slate-800 dark:border-slate-700 dark:text-slate-100">Experience</h3>{experience.some((item) => item.company || item.role || item.description) ? <div className="mt-4 space-y-5">{experience.map((item) => (item.company || item.role || item.description) && <div key={item.id}><div className="flex items-baseline justify-between gap-3"><h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{item.role || 'Role'}</h4><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.company || 'Company'}</span></div><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description || 'Add a responsibility or achievement to show your evidence.'}</p></div>)}</div> : <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">Your experience preview will appear here.</p>}</div>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-[#eef4ff]/60 p-5 dark:border-blue-900/70 dark:bg-blue-950/30" aria-labelledby="bullet-guidance-title">
            <div className="flex items-start gap-3"><JobXIconTile icon={PenLine} size="sm" /><div><p className="product-eyebrow">Bullet guidance</p><h2 id="bullet-guidance-title" className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">Make one role more specific</h2></div></div>
            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Use this safe template for {selectedExperience.role || 'the selected role'}:</p>
            <p className="mt-2 rounded-xl border border-blue-100 bg-white/85 p-3 text-sm leading-6 text-slate-700 dark:border-blue-900/70 dark:bg-slate-900/80 dark:text-slate-200">{achievementTemplate}</p>
            <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">Replace the brackets with facts you can verify. Do not claim a metric you cannot support.</p>
            <button type="button" onClick={copyTemplate} className="product-focus mt-4 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-extrabold text-[#0c3e9e] transition-colors hover:bg-blue-50 dark:border-blue-900 dark:bg-slate-900 dark:text-blue-200 dark:hover:bg-blue-950/50"><ClipboardCopy className="h-3.5 w-3.5" />{copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : 'Copy template'}</button>
          </section>
        </aside>
      </div>
    </div>
  );
}
