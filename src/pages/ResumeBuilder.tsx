import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleGauge,
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
  UserRoundCheck,
  WandSparkles,
} from 'lucide-react';
import { db } from '../services/db';
import { analyzeResume, type ResumeExperience, type ResumePersonal } from '../services/resumeIntelligenceService';
import { useStore } from '../store/StoreProvider';

type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
type CandidateStatus = 'Shortlisted' | 'Under Review' | 'Scheduled' | 'Interviewed';

type Milestone = {
  id: number;
  label: string;
  detail: string;
};

type Candidate = {
  id: number;
  name: string;
  initials: string;
  role: string;
  status: CandidateStatus;
  score: number;
  selected: boolean;
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

const DEFAULT_CANDIDATES: Candidate[] = [
  { id: 1, name: 'Alex Rivera', initials: 'AR', role: 'Product Design', status: 'Shortlisted', score: 94, selected: true },
  { id: 2, name: 'Maya Chen', initials: 'MC', role: 'Design Systems', status: 'Under Review', score: 89, selected: false },
  { id: 3, name: 'Jon Bell', initials: 'JB', role: 'Product Strategy', status: 'Scheduled', score: 86, selected: false },
  { id: 4, name: 'Nina Shah', initials: 'NS', role: 'UX Research', status: 'Interviewed', score: 82, selected: false },
];

const statusStyles: Record<CandidateStatus, string> = {
  Shortlisted: 'status-shortlisted',
  'Under Review': 'status-review',
  Scheduled: 'status-scheduled',
  Interviewed: 'status-interviewed',
};

function getStoredExperience(): ResumeExperience[] {
  const saved = db.get<ResumeExperience[]>('resume_experience', DEFAULT_EXPERIENCE);
  return Array.isArray(saved) && saved.length ? saved : DEFAULT_EXPERIENCE;
}

export default function ResumeBuilder() {
  const store = useStore();
  const [personal, setPersonal] = useState<ResumePersonal>(() => {
    const saved = db.get<Partial<ResumePersonal> | null>('resume_personal', null);
    return {
      name: saved?.name || store.user.name || DEFAULT_PERSONAL.name,
      title: saved?.title || store.user.title || DEFAULT_PERSONAL.title,
      email: saved?.email || store.user.email || DEFAULT_PERSONAL.email,
      phone: saved?.phone || DEFAULT_PERSONAL.phone,
    };
  });
  const [location, setLocation] = useState(store.user.location || 'San Francisco, CA');
  const [summary, setSummary] = useState('Product designer translating complex systems into calm, high-conviction experiences. I pair research depth with strong visual craft to ship products that perform.');
  const [skills, setSkills] = useState(['Product strategy', 'Design systems', 'Figma', 'User research']);
  const [experiences, setExperiences] = useState<ResumeExperience[]>(getStoredExperience);
  const [editingId, setEditingId] = useState<number | null>(1);
  const [milestones, setMilestones] = useState(DEFAULT_MILESTONES);
  const [priority, setPriority] = useState<Priority>('High');
  const [candidates, setCandidates] = useState(DEFAULT_CANDIDATES);
  const [filter, setFilter] = useState<'All' | CandidateStatus>('All');
  const [notice, setNotice] = useState('All changes synced');

  const analysis = useMemo(() => analyzeResume(personal, experiences), [personal, experiences]);
  const profileScore = Math.max(82, analysis.score);
  const filteredCandidates = filter === 'All' ? candidates : candidates.filter((candidate) => candidate.status === filter);

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
    setNotice('ATS cognition optimized · 12 role signals aligned');
  };

  const syncCoordinates = () => {
    db.set('resume_personal', personal);
    db.set('resume_experience', experiences);
    setNotice(`Coordinates synced · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  };

  const toggleCandidate = (id: number) => {
    setCandidates((current) => current.map((candidate) => candidate.id === id ? { ...candidate, selected: !candidate.selected } : candidate));
  };

  const cycleCandidateStatus = (id: number) => {
    const order: CandidateStatus[] = ['Under Review', 'Shortlisted', 'Scheduled', 'Interviewed'];
    setCandidates((current) => current.map((candidate) => {
      if (candidate.id !== id) return candidate;
      const index = order.indexOf(candidate.status);
      return { ...candidate, status: order[(index + 1) % order.length] };
    }));
    setNotice('Candidate evaluation updated');
  };

  return (
    <div className="resume-studio">
      <header className="resume-studio__header">
        <div>
          <div className="resume-studio__eyebrow"><span>Talent intelligence</span><span className="resume-studio__eyebrow-dot" />Live workspace</div>
          <h1>Candidate cognition studio</h1>
          <p>Shape candidate evidence and calibrate the hiring signal in one continuous workspace.</p>
        </div>
        <div className="resume-studio__actions">
          <span className="sync-note"><Check size={13} />{notice}</span>
          <button className="studio-button studio-button--quiet" type="button" onClick={exportResume}><Download size={15} />Export</button>
          <button className="studio-button studio-button--primary" type="button" onClick={syncCoordinates}><Sparkles size={15} />Sync coordinates</button>
        </div>
      </header>

      <div className="studio-metrics" aria-label="Workspace metrics">
        <div><span>Profile strength</span><strong>{profileScore}%</strong><small>+8 this week</small></div>
        <div><span>ATS signal</span><strong>91</strong><small>Top 7% match</small></div>
        <div><span>Pipeline position</span><strong>04</strong><small>Active reviews</small></div>
        <div><span>Last calibrated</span><strong>Today</strong><small>09:42 AM</small></div>
      </div>

      <div className="studio-grid">
        <section className="studio-control-panel" aria-label="Candidate customization controls">
          <div className="studio-section-heading">
            <div><span>01 / Identity</span><h2>Candidate coordinates</h2></div>
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
            <div><span>02 / Workflow</span><h2>Milestone pipeline</h2></div>
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
            <div><span>SYSTEM URGENCY</span><small>Controls review velocity and alert cadence.</small></div>
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
            <div><span>03 / Evidence</span><h2>Experience ledger</h2></div>
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
            <div><span className="live-indicator"><i />Live document</span><strong>Candidate profile / A4</strong></div>
            <button className="optimize-button" type="button" onClick={optimizeResume}><WandSparkles size={15} />Optimize ATS cognition</button>
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
              <span className="paper-label">COMPETENCE MATRIX / 03</span>
              <div>
                {skills.map((skill) => <button key={skill} type="button" onClick={() => setSkills((current) => current.filter((item) => item !== skill))}>{skill}<span>×</span></button>)}
                <button className="add-skill" type="button" onClick={() => setSkills((current) => [...current, `Capability ${current.length + 1}`])}><Plus size={12} />Add</button>
              </div>
            </section>
          </article>

          <section className="candidate-matrix" aria-labelledby="candidate-matrix-title">
            <div className="matrix-heading">
              <div><span>Talent analytics</span><h2 id="candidate-matrix-title">Candidate matrix</h2></div>
              <div className="filter-select">
                <BarChart3 size={14} />
                <select aria-label="Filter candidate status" value={filter} onChange={(event) => setFilter(event.target.value as 'All' | CandidateStatus)}>
                  <option>All</option><option>Shortlisted</option><option>Under Review</option><option>Scheduled</option><option>Interviewed</option>
                </select>
                <ChevronDown size={13} />
              </div>
            </div>
            <div className="matrix-table">
              <div className="matrix-head"><span>Candidate</span><span>Status</span><span>Signal</span><span>Evaluate</span></div>
              {filteredCandidates.map((candidate) => (
                <div className={`matrix-row ${candidate.selected ? 'is-selected' : ''}`} key={candidate.id}>
                  <div className="matrix-candidate">
                    <button className={`studio-check ${candidate.selected ? 'is-checked' : ''}`} type="button" aria-label={`Select ${candidate.name}`} onClick={() => toggleCandidate(candidate.id)}>{candidate.selected && <Check size={11} />}</button>
                    <span className="candidate-avatar">{candidate.initials}</span>
                    <div><strong>{candidate.name}</strong><small>{candidate.role}</small></div>
                  </div>
                  <button type="button" onClick={() => cycleCandidateStatus(candidate.id)} className={`status-pill ${statusStyles[candidate.status]}`}><i />{candidate.status}</button>
                  <div className="signal-score"><span><i style={{ width: `${candidate.score}%` }} /></span><strong>{candidate.score}</strong></div>
                  <button className="evaluate-button" type="button" onClick={() => { toggleCandidate(candidate.id); setNotice(`${candidate.name} evaluation queued`); }}><CircleGauge size={14} />Evaluate</button>
                </div>
              ))}
            </div>
            <div className="matrix-footer">
              <span><UserRoundCheck size={14} />{candidates.filter((candidate) => candidate.selected).length} candidates selected</span>
              <button type="button" onClick={() => setCandidates((current) => current.map((candidate) => ({ ...candidate, selected: true })))}>Select all visible</button>
            </div>
          </section>
        </section>
      </div>

      <footer className="studio-footer">
        <span><BriefcaseBusiness size={14} />JobX intelligence workspace</span>
        <span>Priority signal: <strong>{priority}</strong></span>
      </footer>
    </div>
  );
}
