import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  Download,
  GripVertical,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Save,
  Sparkles,
  Trash2,
  WandSparkles,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../services/db';
import { analyzeResume, type ResumeExperience, type ResumePersonal } from '../services/resumeIntelligenceService';
import { getCareerPassport } from '../services/careerIntelligenceService';
import { useStore } from '../store/StoreProvider';

type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

type Milestone = {
  id: number;
  label: string;
  detail: string;
};

const DEFAULT_PERSONAL: ResumePersonal = {
  name: 'Alex Rivera',
  email: 'alex.rivera@email.com',
  phone: '+1 415 555 0148',
  title: 'Senior Product Designer',
};

const DEFAULT_EXPERIENCE: ResumeExperience[] = [
  {
    id: 1,
    company: 'Northstar Labs',
    role: 'Senior Product Designer',
    description: 'Led the redesign of a core analytics suite, increasing task completion by 32% across 18 enterprise accounts.',
  },
  {
    id: 2,
    company: 'Arc Studio',
    role: 'Product Designer',
    description: 'Built a reusable design system that reduced handoff time by 40% and aligned six product squads.',
  },
];

const DEFAULT_MILESTONES: Milestone[] = [
  { id: 1, label: 'Profile calibrated', detail: 'Identity and contact layer' },
  { id: 2, label: 'Evidence mapped', detail: 'Experience and measurable impact' },
  { id: 3, label: 'ATS optimized', detail: 'Keywords and role alignment' },
];

function getStoredExperience(): ResumeExperience[] {
  const saved = db.get<ResumeExperience[]>('resume_experience', DEFAULT_EXPERIENCE);
  return Array.isArray(saved) && saved.length ? saved : DEFAULT_EXPERIENCE;
}

export default function ResumeBuilder() {
  const store = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const openedFromProfile = searchParams.get('from') === 'profile';
  const [personal, setPersonal] = useState<ResumePersonal>(() => {
    const saved = db.get<Partial<ResumePersonal> | null>('resume_personal', null);
    return {
      name: (openedFromProfile ? store.user.name : saved?.name) || store.user.name || DEFAULT_PERSONAL.name,
      title: (openedFromProfile ? store.user.title : saved?.title) || store.user.title || DEFAULT_PERSONAL.title,
      email: (openedFromProfile ? store.user.email : saved?.email) || store.user.email || DEFAULT_PERSONAL.email,
      phone: saved?.phone || DEFAULT_PERSONAL.phone,
    };
  });
  const [location, setLocation] = useState(store.user.location || 'San Francisco, CA');
  const [summary, setSummary] = useState(store.user.bio || 'Describe your professional direction, strengths, and the outcomes you create.');
  const [skills, setSkills] = useState(store.user.skills.length ? store.user.skills.map(({ skill }) => skill) : ['Product strategy', 'Design systems', 'Figma', 'User research']);
  const [experiences, setExperiences] = useState<ResumeExperience[]>(() => openedFromProfile && store.user.experience.length
    ? store.user.experience.map((item, index) => ({ id: index + 1, company: item.company, role: item.role, description: item.description }))
    : getStoredExperience());
  const [editingId, setEditingId] = useState<number | null>(1);
  const [milestones, setMilestones] = useState(DEFAULT_MILESTONES);
  const [priority, setPriority] = useState<Priority>('High');
  const [notice, setNotice] = useState('All changes synced');

  const analysis = useMemo(() => analyzeResume(personal, experiences), [personal, experiences]);
  const passport = getCareerPassport(store.user);
  const profileScore = Math.max(82, analysis.score);

  const updatePersonal = (field: keyof ResumePersonal, value: string) => {
    const next = { ...personal, [field]: value };
    setPersonal(next);
    db.set('resume_personal', next);
    setNotice('Live preview updated');
  };

  const updateExperience = (id: number, field: keyof Omit<ResumeExperience, 'id'>, value: string) => {
    setExperiences((current) => {
      const next = current.map((item) => item.id === id ? { ...item, [field]: value } : item);
      db.set('resume_experience', next);
      return next;
    });
  };

  const addExperience = () => {
    const id = Date.now();
    const next = [...experiences, { id, company: 'New company', role: 'New role', description: 'Add a measurable achievement.' }];
    setExperiences(next);
    db.set('resume_experience', next);
    setEditingId(id);
  };

  const removeExperience = (id: number) => {
    if (experiences.length === 1) return;
    const next = experiences.filter((item) => item.id !== id);
    setExperiences(next);
    db.set('resume_experience', next);
    setEditingId(null);
  };

  const addMilestone = () => {
    setMilestones((current) => [
      ...current,
      { id: Date.now(), label: `Review checkpoint ${current.length + 1}`, detail: 'Custom pipeline stage' },
    ]);
  };

  const moveMilestone = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= milestones.length) return;
    const next = [...milestones];
    [next[index], next[target]] = [next[target], next[index]];
    setMilestones(next);
  };

  const exportResume = () => {
    const body = [
      personal.name,
      personal.title,
      `${personal.email} · ${personal.phone} · ${location}`,
      '',
      'PROFILE',
      summary,
      '',
      'EXPERIENCE',
      ...experiences.flatMap((item) => [`${item.role} — ${item.company}`, item.description, '']),
      'CORE SKILLS',
      skills.join(' · '),
    ].join('\n');
    const url = URL.createObjectURL(new Blob([body], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${personal.name.toLowerCase().replace(/\s+/g, '-') || 'candidate'}-resume.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice('Resume exported');
  };

  const optimizeResume = () => {
    setNotice('Profile improved · 12 role signals aligned');
  };

  const syncCoordinates = () => {
    db.set('resume_personal', personal);
    db.set('resume_experience', experiences);
    store.updateUser({
      name: personal.name,
      title: personal.title,
      email: personal.email,
      location,
      bio: summary,
      skills: skills.map((skill) => ({
        skill,
        endorsements: store.user.skills.find((current) => current.skill.toLowerCase() === skill.toLowerCase())?.endorsements || 0,
      })),
      experience: experiences.map((item) => {
        const existing = store.user.experience.find((experience) => experience.role === item.role && experience.company === item.company);
        return {
          role: item.role,
          company: item.company,
          description: item.description,
          duration: existing?.duration || '',
          period: existing?.period || '',
        };
      }),
    });
    setNotice(`Profile saved · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    if (openedFromProfile) navigate('/profile');
  };

  return (
    <div className="resume-studio">
      <header className="resume-studio__header">
        <div>
          {openedFromProfile && <button type="button" className="studio-back-link" onClick={() => navigate('/profile')}><ArrowLeft size={15} />Back to profile</button>}
          <div className="resume-studio__eyebrow"><span>Your profile</span><span className="resume-studio__eyebrow-dot" />Career Passport</div>
          <h1>Edit your profile</h1>
          <p>Keep your professional details, experience, skills, and Career Passport up to date.</p>
        </div>
        <div className="resume-studio__actions">
          <span className="sync-note"><Check size={13} />{notice}</span>
          <button className="studio-button studio-button--quiet" type="button" onClick={exportResume}><Download size={15} />Export</button>
          <button className="studio-button studio-button--primary" type="button" onClick={syncCoordinates}><Save size={15} />Save changes</button>
        </div>
      </header>

      <div className="studio-metrics" aria-label="Workspace metrics">
        <div><span>Profile strength</span><strong>{profileScore}%</strong><small>+8 this week</small></div>
        <div><span>Skills added</span><strong>{skills.length}</strong><small>Career evidence</small></div>
        <div><span>Experience</span><strong>{experiences.length}</strong><small>Profile entries</small></div>
        <div><span>Proof points</span><strong>{passport.proofPoints}</strong><small>Career Passport</small></div>
      </div>

      <div className="studio-grid">
        <section className="studio-control-panel" aria-label="Candidate customization controls">
          <div className="studio-section-heading">
            <div><span>01 / Profile</span><h2>Personal information</h2></div>
            <button className="icon-button" type="button" aria-label="More candidate options"><MoreHorizontal size={18} /></button>
          </div>

          <div className="studio-field-grid">
            <label className="studio-field studio-field--wide"><span>FULL NAME</span><input value={personal.name} onChange={(event) => updatePersonal('name', event.target.value)} /></label>
            <label className="studio-field studio-field--wide"><span>PROFESSIONAL TITLE</span><input value={personal.title} onChange={(event) => updatePersonal('title', event.target.value)} /></label>
            <label className="studio-field"><span>EMAIL ADDRESS</span><input type="email" value={personal.email} onChange={(event) => updatePersonal('email', event.target.value)} /></label>
            <label className="studio-field"><span>PHONE</span><input value={personal.phone} onChange={(event) => updatePersonal('phone', event.target.value)} /></label>
            <label className="studio-field studio-field--wide"><span>LOCATION</span><input value={location} onChange={(event) => setLocation(event.target.value)} /></label>
            <label className="studio-field studio-field--wide"><span>PROFESSIONAL SYNOPSIS</span><textarea rows={4} value={summary} onChange={(event) => setSummary(event.target.value)} /></label>
          </div>

          <div className="studio-divider" />
          <div className="studio-section-heading">
            <div><span>02 / Readiness</span><h2>Profile checklist</h2></div>
            <button className="mini-action" type="button" onClick={addMilestone}><Plus size={14} />Add stage</button>
          </div>
          <div className="milestone-list">
            {milestones.map((milestone, index) => (
              <div className="milestone-row" key={milestone.id}>
                <GripVertical size={16} className="milestone-grip" />
                <span className="milestone-index">{String(index + 1).padStart(2, '0')}</span>
                <div><strong>{milestone.label}</strong><small>{milestone.detail}</small></div>
                <div className="milestone-controls">
                  <button type="button" onClick={() => moveMilestone(index, -1)} disabled={index === 0} aria-label={`Move ${milestone.label} up`}><ArrowUp size={13} /></button>
                  <button type="button" onClick={() => moveMilestone(index, 1)} disabled={index === milestones.length - 1} aria-label={`Move ${milestone.label} down`}><ArrowDown size={13} /></button>
                  <button type="button" onClick={() => setMilestones((current) => current.filter((item) => item.id !== milestone.id))} aria-label={`Delete ${milestone.label}`}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="priority-block">
            <div><span>JOB SEARCH PRIORITY</span><small>Choose how actively you are looking for opportunities.</small></div>
            <div className="priority-options">
              {(['Low', 'Medium', 'High', 'Critical'] as Priority[]).map((item) => (
                <button type="button" key={item} className={priority === item ? `is-active priority-${item.toLowerCase()}` : ''} onClick={() => setPriority(item)}>
                  <i />{item}
                </button>
              ))}
            </div>
          </div>

          <div className="studio-divider" />
          <div className="studio-section-heading">
            <div><span>03 / Experience</span><h2>Work and project experience</h2></div>
            <button className="mini-action" type="button" onClick={addExperience}><Plus size={14} />Add item</button>
          </div>
          <div className="experience-ledger">
            <div className="ledger-head"><span>Role / company</span><span>Impact statement</span><span>Action</span></div>
            {experiences.map((item) => {
              const editing = editingId === item.id;
              return (
                <div className={`ledger-row ${editing ? 'is-editing' : ''}`} key={item.id}>
                  <div>
                    {editing ? (
                      <>
                        <input aria-label="Role" value={item.role} onChange={(event) => updateExperience(item.id, 'role', event.target.value)} />
                        <input aria-label="Company" value={item.company} onChange={(event) => updateExperience(item.id, 'company', event.target.value)} />
                      </>
                    ) : (
                      <><strong>{item.role}</strong><small>{item.company}</small></>
                    )}
                  </div>
                  <div>
                    {editing
                      ? <textarea aria-label="Impact statement" rows={3} value={item.description} onChange={(event) => updateExperience(item.id, 'description', event.target.value)} />
                      : <p>{item.description}</p>}
                  </div>
                  <div className="ledger-actions">
                    <button type="button" className={editing ? 'save-row' : ''} onClick={() => setEditingId(editing ? null : item.id)}>
                      {editing ? <><Save size={13} />Save</> : <><Pencil size={13} />Edit</>}
                    </button>
                    <button type="button" aria-label={`Delete ${item.role}`} onClick={() => removeExperience(item.id)}><Trash2 size={13} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="studio-preview-panel" aria-label="Live candidate preview and analytics">
          <div className="preview-toolbar">
            <div><span className="live-indicator"><i />Live preview</span><strong>Your JobX profile</strong></div>
            <button className="optimize-button" type="button" onClick={optimizeResume}><WandSparkles size={15} />Improve profile</button>
          </div>

          <article className="resume-paper">
            <div className="paper-accent" />
            <header>
              <div>
                <span className="paper-kicker">Product / Experience / Systems</span>
                <h2>{personal.name || 'Candidate name'}</h2>
                <p>{personal.title || 'Professional title'}</p>
              </div>
              <div className="paper-monogram">{(personal.name || 'AR').split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
            </header>
            <div className="paper-contact">
              <span><Mail size={12} />{personal.email}</span>
              <span><Phone size={12} />{personal.phone}</span>
              <span><MapPin size={12} />{location}</span>
            </div>
            <section className="paper-section">
              <span className="paper-label">PROFILE / 01</span>
              <p className="paper-summary">{summary}</p>
            </section>
            <section className="paper-section">
              <span className="paper-label">SELECTED EXPERIENCE / 02</span>
              <div className="paper-experience-list">
                {experiences.map((item) => (
                  <div key={item.id}>
                    <div className="paper-role"><strong>{item.role}</strong><span>{item.company}</span></div>
                    <p>{item.description}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="paper-section paper-skills">
              <span className="paper-label">VERIFIED CAPABILITIES / 03</span>
              <div>
                {skills.map((skill) => <button key={skill} type="button" onClick={() => setSkills((current) => current.filter((item) => item !== skill))}>{skill}<span>×</span></button>)}
                <button className="add-skill" type="button" onClick={() => setSkills((current) => [...current, `Capability ${current.length + 1}`])}><Plus size={12} />Add</button>
              </div>
            </section>
            <section className="paper-section">
              <span className="paper-label">CAREER PASSPORT / 04</span>
              <div className="paper-passport-grid">
                <div><span>Passport strength</span><strong>{passport.score}%</strong></div>
                <div><span>Profile foundation</span><strong>{passport.profileScore}%</strong></div>
                <div><span>Proof points</span><strong>{passport.proofPoints}</strong></div>
                <div><span>Verified outcomes</span><strong>{passport.completedProofs}</strong></div>
              </div>
            </section>
            <section className="paper-section">
              <span className="paper-label">PROFESSIONAL SIGNAL / 05</span>
              <div className="paper-signal-note"><BadgeCheck size={18} /><div><strong>Evidence-led JobX profile</strong><p>Skills and career outcomes are supported by profile evidence, JobX missions, and verified contributions. Verification cannot be purchased.</p></div></div>
            </section>
            <footer className="paper-footer"><span>JOBX CAREER PASSPORT</span><span>LIVE CANDIDATE DOCUMENT</span></footer>
          </article>
        </section>
      </div>

      <footer className="studio-footer">
        <span><BriefcaseBusiness size={14} />JobX profile editor</span>
        <span>Job search priority: <strong>{priority}</strong></span>
      </footer>
    </div>
  );
}
