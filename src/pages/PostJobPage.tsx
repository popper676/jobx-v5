import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Tag,
  Plus,
  DollarSign,
  Building2,
  MapPin,
  Globe,
  AlertCircle,
  PenLine,
  Eye,
  Save,
  ChevronRight,
  Trash2,
  MousePointerClick,
  Mail,
  ExternalLink,
  Heart,
  Clock,
  GraduationCap,
  Shield,
  Baby,
  Zap,
  TrendingUp,
  Coffee,
  Monitor,
  Home,
  Users,
  Building,
  Hash,
  Type,
  HelpCircle,
  Copy,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import ScrollReveal from '../components/employer/ScrollReveal';
import SpotlightCard from '../components/employer/SpotlightCard';
import CustomTooltip from '../components/employer/CustomTooltip';
import AnimatedModal from '../components/employer/AnimatedModal';
import { employerJobService } from '../services/employerJobService';
import type { ResponseCommitmentDays } from '../services/trustService';

// ===== TYPES =====
type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
type WorkplaceType = 'On-site' | 'Hybrid' | 'Remote';
type ExperienceLevel = 'Entry' | 'Mid' | 'Senior' | 'Lead';
type Currency = 'USD' | 'EUR' | 'GBP' | 'SGD' | 'MMK' | 'JPY';
type PayPeriod = 'per year' | 'per month' | 'per hour' | 'per week';
type ApplicationType = 'easy' | 'external' | 'email';

interface ScreeningQuestion {
  id: string;
  question: string;
  type: 'text' | 'yesno' | 'number' | 'choice';
  required: boolean;
  options?: string[];
}

interface JobFormData {
  title: string;
  type: JobType;
  workplace: WorkplaceType;
  location: string;
  locations: string[];
  department: string;
  description: string;
  skills: string[];
  skillLevel: 'required' | 'preferred';
  salaryMin: string;
  salaryMax: string;
  currency: Currency;
  payPeriod: PayPeriod;
  experience: ExperienceLevel;
  benefits: string[];
  applicationType: ApplicationType;
  applicationValue: string;
  screeningQuestions: ScreeningQuestion[];
  isPromoted: boolean;
  targetAudience: string[];
  responseCommitmentDays: ResponseCommitmentDays;
}

// ===== CONSTANTS =====
const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Customer Success',
  'Data',
  'Legal',
  'Admin',
];

const JOB_TYPES: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Internship'];

const WORKPLACE_TYPES: { key: WorkplaceType; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: 'On-site', label: 'On-site', desc: 'Come to office every day', icon: <Building className="w-4 h-4" /> },
  { key: 'Hybrid', label: 'Hybrid', desc: '2-3 days in office / week', icon: <Users className="w-4 h-4" /> },
  { key: 'Remote', label: 'Remote', desc: 'Work from anywhere', icon: <Home className="w-4 h-4" /> },
];

const EXP_LEVELS: { key: ExperienceLevel; label: string; desc: string }[] = [
  { key: 'Entry', label: 'Entry Level', desc: '0-2 years' },
  { key: 'Mid', label: 'Mid Level', desc: '2-5 years' },
  { key: 'Senior', label: 'Senior', desc: '5-10 years' },
  { key: 'Lead', label: 'Lead / Manager', desc: '10+ years' },
];

const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'SGD', 'MMK', 'JPY'];

const PAY_PERIODS: PayPeriod[] = ['per year', 'per month', 'per hour', 'per week'];

const BENEFITS_PRESET: { label: string; icon: React.ReactNode }[] = [
  { label: 'Health insurance', icon: <Heart className="w-3.5 h-3.5" /> },
  { label: 'Dental & Vision', icon: <Shield className="w-3.5 h-3.5" /> },
  { label: '401(k) / Retirement', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { label: 'Paid time off', icon: <Clock className="w-3.5 h-3.5" /> },
  { label: 'Remote work', icon: <Monitor className="w-3.5 h-3.5" /> },
  { label: 'Flexible hours', icon: <Coffee className="w-3.5 h-3.5" /> },
  { label: 'Equity / Stock', icon: <Zap className="w-3.5 h-3.5" /> },
  { label: 'Performance bonus', icon: <DollarSign className="w-3.5 h-3.5" /> },
  { label: 'Parental leave', icon: <Baby className="w-3.5 h-3.5" /> },
  { label: 'Professional development', icon: <GraduationCap className="w-3.5 h-3.5" /> },
];

const PRESET_SCREENING_QUESTIONS: { question: string; type: ScreeningQuestion['type']; required: boolean }[] = [
  { question: 'How many years of experience do you have with [primary skill]?', type: 'number', required: true },
  { question: 'Are you legally authorized to work in this country?', type: 'yesno', required: true },
  { question: 'Do you require visa sponsorship?', type: 'yesno', required: true },
  { question: 'What is your current notice period?', type: 'text', required: false },
  { question: 'What is your expected salary range?', type: 'text', required: false },
];

const RESPONSE_COMMITMENTS: Array<{ days: ResponseCommitmentDays; label: string; description: string; recommended?: boolean }> = [
  { days: 3, label: 'Fast response', description: 'Best for small, active hiring teams' },
  { days: 5, label: 'Balanced', description: 'Clear and realistic for most teams', recommended: true },
  { days: 7, label: 'Standard', description: 'More time for larger review panels' },
];

const AI_DESCRIPTION_TEMPLATES = [
  "We are looking for a [ROLE] to join our [DEPARTMENT] team. You will be responsible for [RESPONSIBILITY]. The ideal candidate has [YEARS] years of experience with [SKILL1], [SKILL2], and [SKILL3].",
  "Join our fast-growing [DEPARTMENT] team as a [ROLE]! You'll work on [PROJECT_TYPE] and collaborate with cross-functional teams. Requirements: proficiency in [SKILL1], strong problem-solving, and a passion for [INDUSTRY].",
  "As a [ROLE], you'll drive [IMPACT] for our [PRODUCT_TYPE]. We're seeking someone with deep expertise in [SKILL1] and [SKILL2], plus experience building [PROJECT_TYPE]. Competitive salary + equity offered.",
];

const stepMeta = [
  { num: 1, label: 'Basic Info', description: 'Role essentials', icon: <Briefcase className="w-4 h-4" /> },
  { num: 2, label: 'Details', description: 'Skills & compensation', icon: <PenLine className="w-4 h-4" /> },
  { num: 3, label: 'Application', description: 'How candidates apply', icon: <MousePointerClick className="w-4 h-4" /> },
  { num: 4, label: 'Review', description: 'Preview & publish', icon: <Eye className="w-4 h-4" /> },
];

const existingJobs = [
  { id: 'e1', title: 'Senior React Engineer' },
  { id: 'e2', title: 'Product Designer' },
  { id: 'e3', title: 'Backend Developer (Go)' },
  { id: 'e4', title: 'DevOps Engineer' },
];

export default function PostJobPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<JobFormData>({
    title: '',
    type: 'Full-time',
    workplace: 'On-site',
    location: '',
    locations: [],
    department: '',
    description: '',
    skills: [],
    skillLevel: 'required',
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    payPeriod: 'per year',
    experience: 'Mid',
    benefits: [],
    applicationType: 'easy',
    applicationValue: '',
    screeningQuestions: [],
    isPromoted: false,
    targetAudience: [],
    responseCommitmentDays: 5,
  });
  const [skillInput, setSkillInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof JobFormData, string>>>({});
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');

  const hasBasicInfo = Boolean(form.title.trim() && form.department && (form.workplace === 'Remote' || form.location.trim()));
  const hasRoleDetails = Boolean(form.description.trim().length >= 20 && form.skills.length > 0 && form.salaryMin && form.salaryMax);
  const stepCompletion = [
    hasBasicInfo,
    hasBasicInfo && hasRoleDetails,
    hasBasicInfo && hasRoleDetails && (form.applicationType === 'easy' || Boolean(form.applicationValue.trim())),
    false,
  ];
  const completedSteps = stepCompletion.filter(Boolean).length;
  const progressPercent = Math.round((Math.max(step - 1, completedSteps) / (stepMeta.length - 1)) * 100);
  const descriptionScore = Math.min(100,
    (form.title.trim() ? 15 : 0)
    + (form.department ? 10 : 0)
    + Math.min(25, Math.floor(form.description.trim().length / 20) * 5)
    + Math.min(20, form.skills.length * 5)
    + (form.description.match(/\b(impact|outcome|deliver|improve|build|lead|measure)\b/gi)?.length || 0) * 3
    + (form.salaryMin && form.salaryMax ? 10 : 0)
  );

  // ===== HELPERS =====
  const update = <K extends keyof JobFormData>(key: K, value: JobFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggleBenefit = (benefit: string) => {
    setForm((prev) => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter((b) => b !== benefit)
        : [...prev.benefits, benefit],
    }));
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setSkillInput('');
      setErrors((prev) => ({ ...prev, skills: undefined }));
    }
  };

  const removeSkill = (skill: string) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const addLocation = () => {
    const trimmed = locationInput.trim();
    if (trimmed && !form.locations.includes(trimmed)) {
      setForm((prev) => ({ ...prev, locations: [...prev.locations, trimmed] }));
      setLocationInput('');
    }
  };

  const removeLocation = (loc: string) => {
    setForm((prev) => ({ ...prev, locations: prev.locations.filter((l) => l !== loc) }));
  };

  const addScreeningQuestion = (q: Omit<ScreeningQuestion, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    setForm((prev) => ({
      ...prev,
      screeningQuestions: [...prev.screeningQuestions, { ...q, id }],
    }));
  };

  const removeScreeningQuestion = (id: string) => {
    setForm((prev) => ({
      ...prev,
      screeningQuestions: prev.screeningQuestions.filter((q) => q.id !== id),
    }));
  };

  const generateAIDescription = () => {
    setIsGeneratingDescription(true);
    setTimeout(() => {
      const template = AI_DESCRIPTION_TEMPLATES[Math.floor(Math.random() * AI_DESCRIPTION_TEMPLATES.length)]
        .replace('[ROLE]', form.title || 'Software Engineer')
        .replace('[DEPARTMENT]', form.department || 'Engineering')
        .replace('[SKILL1]', form.skills[0] || 'JavaScript')
        .replace('[SKILL2]', form.skills[1] || 'React')
        .replace('[SKILL3]', form.skills[2] || 'TypeScript')
        .replace('[YEARS]', form.experience === 'Entry' ? '0-2' : form.experience === 'Mid' ? '2-5' : '5+')
        .replace('[RESPONSIBILITY]', 'building scalable web applications')
        .replace('[PROJECT_TYPE]', 'customer-facing products')
        .replace('[IMPACT]', 'product innovation')
        .replace('[PRODUCT_TYPE]', 'SaaS platform')
        .replace('[INDUSTRY]', 'technology');
      setGeneratedDescription(template);
      setIsGeneratingDescription(false);
    }, 1500);
  };

  const applyGeneratedDescription = () => {
    if (generatedDescription) {
      update('description', generatedDescription);
      setGeneratedDescription('');
    }
  };

  const repostFromExisting = (jobTitle: string) => {
    setForm((prev) => ({
      ...prev,
      title: jobTitle,
      description: `We are hiring a ${jobTitle} to join our team.`,
    }));
    setShowRepostModal(false);
  };

  // ===== VALIDATION =====
  const validateStep = (s: number): boolean => {
    const nextErrors: typeof errors = {};
    if (s === 1) {
      if (!form.title.trim()) nextErrors.title = 'Job title is required';
      if (!form.location.trim() && form.workplace !== 'Remote') nextErrors.location = 'Location is required (or select Remote)';
      if (!form.department) nextErrors.department = 'Please select a department';
    }
    if (s === 2) {
      if (!form.description.trim() || form.description.length < 20)
        nextErrors.description = 'Please provide at least 20 characters';
      if (form.skills.length === 0) nextErrors.skills = 'Add at least one required skill';
      if (!form.salaryMin || !form.salaryMax) nextErrors.salaryMin = 'Enter a salary range';
    }
    if (s === 3) {
      if (form.applicationType === 'external' && !form.applicationValue.trim())
        nextErrors.applicationValue = 'Enter the external application URL';
      if (form.applicationType === 'email' && !form.applicationValue.trim())
        nextErrors.applicationValue = 'Enter the application email address';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const next = () => { if (validateStep(step) && step < 4) setStep(step + 1); };
  const back = () => { if (step > 1) { setStep(step - 1); setErrors({}); } };
  const goToStep = (s: number) => { if (s < step) { setStep(s); setErrors({}); } };

  const handlePublish = () => {
    if (validateStep(step)) {
      setSaveError('');
      setShowPublishModal(true);
    }
  };
  const confirmPublish = () => {
    const result = employerJobService.create({
      title: form.title,
      location: form.location,
      currency: form.currency,
      salaryMin: form.salaryMin,
      salaryMax: form.salaryMax,
      payPeriod: form.payPeriod,
      status: 'Active',
      responseCommitmentDays: form.responseCommitmentDays,
    });
    if (!result.ok) {
      setSaveError(result.error || 'Unable to publish this job post.');
      return;
    }
    setSaveError('');
    setShowPublishModal(false);
    navigate('/my-posts');
  };
  const handleSaveDraft = () => {
    setSaveError('');
    setShowDraftModal(true);
  };
  const confirmDraft = () => {
    const result = employerJobService.create({
      title: form.title,
      location: form.location,
      currency: form.currency,
      salaryMin: form.salaryMin,
      salaryMax: form.salaryMax,
      payPeriod: form.payPeriod,
      status: 'Draft',
      responseCommitmentDays: form.responseCommitmentDays,
    });
    if (!result.ok) {
      setSaveError(result.error || 'Unable to save this draft.');
      return;
    }
    setSaveError('');
    setShowDraftModal(false);
    navigate('/my-posts');
  };

  // ===== RENDER HELPERS =====
  const InputField = ({ label, required, children, error, helpText }: {
    label: string; required?: boolean; children: React.ReactNode; error?: string; helpText?: string;
  }) => (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
        {label}{required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3 shrink-0" />{error}
        </motion.p>
      )}
      {helpText && !error && <p className="text-xs text-gray-400 mt-1">{helpText}</p>}
    </div>
  );

  return (
    <div className="job-post-page min-h-screen bg-[#F8F3F0]/80 pb-20">
      <header className="sticky top-16 z-30 border-b border-gray-200/80 bg-white/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3 sm:h-[4.5rem]">
            <div className="flex min-w-0 items-center gap-3">
              <motion.button whileHover={{ x: -2 }} onClick={() => window.history.back()} aria-label="Go back" className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#F8F3F0] hover:text-[#014BAA]">
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div className="min-w-0"><h1 className="truncate text-lg font-bold tracking-tight text-gray-900 sm:text-xl">Post a job</h1><p className="text-xs text-gray-500">Step {step} of {stepMeta.length} · {stepMeta[step - 1].label}</p></div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button onClick={() => setShowRepostModal(true)} aria-label="Reuse a previous job post" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-2.5 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-blue-200 hover:bg-blue-50/60 sm:px-3"><Copy className="w-4 h-4" /><span className="hidden sm:inline">Reuse</span></button>
              <button onClick={handleSaveDraft} aria-label="Save job post as draft" className="inline-flex items-center gap-2 rounded-lg bg-[#014BAA] px-2.5 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition-colors hover:bg-[#013b86] sm:px-3"><Save className="w-4 h-4" /><span className="hidden sm:inline">Save draft</span></button>
            </div>
          </div>

          <div className="border-t border-gray-100 py-3 sm:py-3.5">
            <div className="grid grid-cols-4 gap-1" role="progressbar" aria-label={`Job post is ${progressPercent}% complete`} aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
              {stepMeta.map((item) => {
                const isCurrent = item.num === step;
                const isComplete = item.num < step;
                return <div key={item.num} className="min-w-0"><div className={`h-1 rounded-full transition-colors ${isCurrent || isComplete ? 'bg-[#014BAA]' : 'bg-gray-100'}`} /><p className={`mt-2 truncate text-[11px] font-semibold sm:text-xs ${isCurrent ? 'text-[#014BAA]' : isComplete ? 'text-gray-600' : 'text-gray-400'}`}><span className="hidden sm:inline">{item.num}. </span>{item.label}</p></div>;
              })}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-7 sm:px-6 lg:px-8 sm:py-9">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16.5rem] lg:gap-7">
          {/* ===== DESKTOP SIDEBAR ===== */}
          <aside className="hidden lg:order-2 lg:block">
            <div className="sticky top-36 space-y-4">
              <ScrollReveal direction="left" delay={0}>
                <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between px-2.5 pb-3 pt-1"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">Posting checklist</p><span className="text-xs font-bold text-[#014BAA]">{completedSteps}/3</span></div>
                  <div className="relative space-y-1 before:absolute before:bottom-7 before:left-[1.65rem] before:top-7 before:w-px before:bg-gray-100">
                    {stepMeta.map((s) => {
                      const isActive = step === s.num;
                      const isCompleted = step > s.num;
                      return <button key={s.num} onClick={() => isCompleted && goToStep(s.num)} disabled={!isCompleted && !isActive} className={`relative flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all ${isActive ? 'bg-blue-50/80' : isCompleted ? 'hover:bg-[#F8F3F0]' : 'cursor-not-allowed opacity-55'}`}>
                        <span className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${isActive || isCompleted ? 'border-[#014BAA] bg-[#014BAA] text-white' : 'border-gray-200 bg-white text-gray-400'}`}>{isCompleted ? <Check className="w-3.5 h-3.5" /> : s.num}</span>
                        <span className="min-w-0"><span className={`block text-sm font-semibold ${isActive ? 'text-[#014BAA]' : 'text-gray-800'}`}>{s.label}</span><span className="mt-0.5 block text-xs leading-4 text-gray-400">{s.description}</span></span>
                      </button>;
                    })}
                  </div>
                </div>
              </ScrollReveal>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/55 p-4">
                <div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#014BAA] shadow-sm"><Shield className="w-4 h-4" /></span><div><p className="text-sm font-bold text-[#014BAA]">Response promise</p><p className="mt-1 text-xs leading-5 text-blue-700/75">Applicants will see a clear response window after you publish.</p></div></div>
              </div>

              <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">Candidate preview</p>
                <p className="mt-3 truncate text-sm font-bold text-gray-900">{form.title || 'Your job title'}</p>
                <p className="mt-1 text-xs text-gray-500">{form.department || 'Department'} · {form.workplace}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">{form.skills.slice(0, 3).map((skill) => <span key={skill} className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-[#014BAA]">{skill}</span>)}{form.skills.length === 0 && <span className="text-xs text-gray-400">Your skills will show here</span>}</div>
              </div>
            </div>
          </aside>

          {/* ===== MAIN FORM ===== */}
          <div className="min-w-0 lg:order-1">
            <ScrollReveal direction="up" delay={0.1}>
              <SpotlightCard className="rounded-[1.5rem] shadow-[0_18px_45px_rgba(15,23,42,0.055)]">
                <div className="p-6 sm:p-8">
                  <AnimatePresence mode="wait">
                    {/* ===== STEP 1: BASIC INFO ===== */}
                    {step === 1 && (
                      <motion.div key="step1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }} className="space-y-6">
                        <div className="flex items-start justify-between gap-4 mb-6">
                          <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Briefcase className="w-5 h-5 text-[#014BAA]" /></div>
                          <div>
                            <h2 className="text-lg font-bold text-gray-900">Basic information</h2>
                            <p className="text-xs text-gray-500">Set the role, workplace and team</p>
                          </div>
                          </div>
                          <span className="hidden shrink-0 rounded-full bg-[#F8F3F0] px-2.5 py-1 text-[11px] font-semibold text-gray-500 sm:inline-flex">About 2 min</span>
                        </div>

                        <InputField label="Job Title" required error={errors.title}>
                          <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Senior React Engineer"
                            className={`w-full bg-[#F8F3F0] rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 border outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 ${errors.title ? 'border-red-300' : 'border-gray-200 focus:border-[#014BAA]'}`} />
                        </InputField>

                        {/* Workplace Type */}
                        <InputField label="Workplace Type" required>
                          <div className="grid grid-cols-3 gap-3">
                            {WORKPLACE_TYPES.map((wp) => (
                              <motion.button key={wp.key} aria-pressed={form.workplace === wp.key} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => update('workplace', wp.key)}
                                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all ${
                                  form.workplace === wp.key ? 'bg-blue-50 border-[#014BAA] text-[#014BAA] shadow-sm shadow-blue-500/10' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                                }`}>
                                <div className={`p-2 rounded-lg ${form.workplace === wp.key ? 'bg-blue-100' : 'bg-gray-100'}`}>{wp.icon}</div>
                                <span className="text-sm font-semibold">{wp.label}</span>
                                <span className="text-[11px] text-gray-400">{wp.desc}</span>
                              </motion.button>
                            ))}
                          </div>
                        </InputField>

                        {/* Job Type */}
                        <InputField label="Job Type">
                          <div className="flex flex-wrap gap-2">
                            {JOB_TYPES.map((t) => (
                              <motion.button key={t} aria-pressed={form.type === t} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => update('type', t)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                  form.type === t ? 'bg-[#014BAA] text-white border-[#014BAA] shadow-sm shadow-blue-500/20' : 'bg-white text-gray-600 border-gray-200 hover:border-[#014BAA] hover:text-[#014BAA]'
                                }`}>{t}</motion.button>
                            ))}
                          </div>
                        </InputField>

                        {/* Location */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <InputField label="Primary Location" required error={errors.location}
                            helpText={form.workplace === 'Remote' ? 'Remote position — location optional' : undefined}>
                            <div className="relative">
                              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input type="text" value={form.location} onChange={(e) => update('location', e.target.value)}
                                placeholder="e.g. San Francisco, CA" disabled={form.workplace === 'Remote'}
                                className={`w-full bg-[#F8F3F0] rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 border outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 ${errors.location ? 'border-red-300' : 'border-gray-200 focus:border-[#014BAA]'} ${form.workplace === 'Remote' ? 'opacity-50' : ''}`} />
                            </div>
                          </InputField>

                          <InputField label="Department" required error={errors.department}>
                            <div className="relative">
                              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <select value={form.department} onChange={(e) => update('department', e.target.value)}
                                className={`w-full bg-[#F8F3F0] rounded-xl pl-11 pr-10 py-3 text-sm text-gray-900 border outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 appearance-none ${errors.department ? 'border-red-300' : 'border-gray-200 focus:border-[#014BAA]'}`}>
                                <option value="">Select department...</option>
                                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                              </select>
                              <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                            </div>
                          </InputField>
                        </div>

                        {/* Additional locations */}
                        <InputField label="Additional Locations" helpText="Add more office locations for hybrid roles">
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input type="text" value={locationInput} onChange={(e) => setLocationInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                                placeholder="e.g. New York, NY" className="w-full bg-[#F8F3F0] rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-[#014BAA] focus:bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addLocation}
                              className="px-4 py-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-[#014BAA] hover:text-white transition-colors text-sm font-medium"><Plus className="w-4 h-4" /></motion.button>
                          </div>
                          <AnimatePresence>
                            {form.locations.length > 0 && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-2 mt-3">
                                {form.locations.map((loc) => (
                                  <motion.span key={loc} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-[#014BAA] border border-blue-200">
                                    {loc}
                                    <button onClick={() => removeLocation(loc)} className="p-0.5 hover:text-[#014BAA] hover:bg-blue-100 rounded transition-colors"><X className="w-3 h-3" /></button>
                                  </motion.span>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </InputField>
                      </motion.div>
                    )}

                    {/* ===== STEP 2: DETAILS ===== */}
                    {step === 2 && (
                      <motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }} className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><PenLine className="w-5 h-5 text-blue-500" /></div>
                          <div>
                            <h2 className="text-lg font-bold text-gray-900">Job Details</h2>
                            <p className="text-xs text-gray-500">Describe the role and requirements</p>
                          </div>
                        </div>

                        <section className="overflow-hidden rounded-2xl border border-[#173b67]/20 bg-gradient-to-br from-[#12213a] to-[#173b67] text-white shadow-lg shadow-blue-950/10">
                          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-4">
                              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#b7ff3c] ring-1 ring-white/15"><WandSparkles className="h-6 w-6" /></span>
                              <div><p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-[#b7ff3c]">Built into your posting workflow</p><h3 className="mt-1 text-xl font-black">AI Job Description Copilot</h3><p className="mt-1 max-w-xl text-xs leading-5 text-slate-300">Use the role information you already entered to create an inclusive, outcome-based description with clearer skills and expectations.</p></div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="min-w-24 rounded-xl bg-white/10 px-4 py-3 text-center"><strong className="block text-2xl font-black text-[#b7ff3c]">{descriptionScore}%</strong><span className="text-[0.62rem] font-bold text-slate-300">Posting quality</span></div>
                              <button onClick={generateAIDescription} disabled={isGeneratingDescription || !form.title} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#b7ff3c] px-4 text-sm font-black text-[#12213a] transition hover:bg-[#c9ff6f] disabled:cursor-not-allowed disabled:opacity-50"><Sparkles className={`h-4 w-4 ${isGeneratingDescription ? 'animate-pulse' : ''}`} />{isGeneratingDescription ? 'Analyzing role…' : form.description ? 'Improve with AI' : 'Draft with AI'}</button>
                            </div>
                          </div>
                          <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3">
                            <div className="bg-[#12213a]/90 p-3 text-xs"><Check className="mr-1.5 inline h-3.5 w-3.5 text-[#b7ff3c]" />Bias-aware language scan</div>
                            <div className="bg-[#12213a]/90 p-3 text-xs"><Check className="mr-1.5 inline h-3.5 w-3.5 text-[#b7ff3c]" />Outcome-focused responsibilities</div>
                            <div className="bg-[#12213a]/90 p-3 text-xs"><Check className="mr-1.5 inline h-3.5 w-3.5 text-[#b7ff3c]" />Skills and seniority alignment</div>
                          </div>
                        </section>

                        {/* Description drafting assistance */}
                        <InputField label="Job Description" required error={errors.description} helpText={`${form.description.length} characters (min 20)`}>
                          <div className="relative">
                            <textarea rows={6} value={form.description} onChange={(e) => update('description', e.target.value)}
                              placeholder="Describe the role, responsibilities, team structure, and what you're looking for in an ideal candidate..."
                              className={`w-full bg-[#F8F3F0] rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 border outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 resize-none ${errors.description ? 'border-red-300' : 'border-gray-200 focus:border-[#014BAA]'}`} />
                            {generatedDescription && (
                              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 overflow-hidden rounded-xl border border-lime-200 bg-lime-50">
                                <div className="flex items-center justify-between border-b border-lime-200 px-4 py-3"><p className="inline-flex items-center gap-2 text-xs font-black text-[#24451c]"><Sparkles className="h-4 w-4" />AI Copilot recommendation</p><button onClick={applyGeneratedDescription} className="rounded-lg bg-[#173b67] px-3 py-1.5 text-xs font-black text-white">Apply to job post</button></div>
                                <p className="p-4 text-sm leading-6 text-slate-700">{generatedDescription}</p>
                              </motion.div>
                            )}
                          </div>
                        </InputField>

                        {/* Skills */}
                        <InputField label="Required Skills" required error={errors.skills} helpText="Press Enter or click + to add each skill">
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                                placeholder="e.g. React" className="w-full bg-[#F8F3F0] rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-[#014BAA] focus:bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addSkill}
                              className="px-4 py-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-[#014BAA] hover:text-white transition-colors text-sm font-medium"><Plus className="w-4 h-4" /></motion.button>
                          </div>
                          <AnimatePresence>
                            {form.skills.length > 0 && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-2 mt-3">
                                {form.skills.map((skill) => (
                                  <motion.span key={skill} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-[#014BAA] border border-blue-200">
                                    {skill}
                                    <button onClick={() => removeSkill(skill)} className="p-0.5 hover:text-[#014BAA] hover:bg-blue-100 rounded transition-colors"><X className="w-3 h-3" /></button>
                                  </motion.span>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </InputField>

                        {/* Experience Level */}
                        <InputField label="Experience Level">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {EXP_LEVELS.map((lvl) => (
                              <motion.button key={lvl.key} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} onClick={() => update('experience', lvl.key)}
                                className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all ${
                                  form.experience === lvl.key ? 'bg-[#014BAA]/5 border-[#014BAA] text-[#014BAA] shadow-sm shadow-blue-500/10' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                                }`}>
                                <span className="text-sm font-semibold">{lvl.label}</span>
                                <span className="text-[11px] text-gray-400 mt-0.5">{lvl.desc}</span>
                              </motion.button>
                            ))}
                          </div>
                        </InputField>

                        {/* Salary with Currency + Period */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div className="sm:col-span-1">
                            <InputField label="Currency">
                              <select value={form.currency} onChange={(e) => update('currency', e.target.value as Currency)}
                                className="w-full bg-[#F8F3F0] rounded-xl px-4 py-3 text-sm text-gray-900 border border-gray-200 focus:border-[#014BAA] focus:bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500/20 appearance-none">
                                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </InputField>
                          </div>
                          <div className="sm:col-span-1">
                            <InputField label="Pay Period">
                              <select value={form.payPeriod} onChange={(e) => update('payPeriod', e.target.value as PayPeriod)}
                                className="w-full bg-[#F8F3F0] rounded-xl px-4 py-3 text-sm text-gray-900 border border-gray-200 focus:border-[#014BAA] focus:bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500/20 appearance-none">
                                {PAY_PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
                              </select>
                            </InputField>
                          </div>
                          <div className="sm:col-span-1">
                            <InputField label="Min" required error={errors.salaryMin}>
                              <div className="relative">
                                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="number" value={form.salaryMin} onChange={(e) => update('salaryMin', e.target.value)}
                                  placeholder="120000" className={`w-full bg-[#F8F3F0] rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 border outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 ${errors.salaryMin ? 'border-red-300' : 'border-gray-200 focus:border-[#014BAA]'}`} />
                              </div>
                            </InputField>
                          </div>
                          <div className="sm:col-span-1">
                            <InputField label="Max" required>
                              <div className="relative">
                                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="number" value={form.salaryMax} onChange={(e) => update('salaryMax', e.target.value)}
                                  placeholder="150000" className="w-full bg-[#F8F3F0] rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-[#014BAA] focus:bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500/20" />
                              </div>
                            </InputField>
                          </div>
                        </div>

                        {/* Benefits */}
                        <InputField label="Benefits & Perks" helpText="Select all that apply to attract top candidates">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {BENEFITS_PRESET.map((b) => (
                              <motion.button key={b.label} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => toggleBenefit(b.label)}
                                className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                                  form.benefits.includes(b.label)
                                    ? 'bg-blue-50 border-[#014BAA] text-[#014BAA] shadow-sm shadow-blue-500/5'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50/30'
                                }`}>
                                {b.icon}
                                <span className="text-xs font-medium">{b.label}</span>
                                {form.benefits.includes(b.label) && <Check className="w-3.5 h-3.5 ml-auto" />}
                              </motion.button>
                            ))}
                          </div>
                        </InputField>
                      </motion.div>
                    )}

                    {/* ===== STEP 3: APPLICATION ===== */}
                    {step === 3 && (
                      <motion.div key="step3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }} className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><MousePointerClick className="w-5 h-5 text-blue-500" /></div>
                          <div>
                            <h2 className="text-lg font-bold text-gray-900">Application Settings</h2>
                            <p className="text-xs text-gray-500">Choose how candidates apply and add screening questions</p>
                          </div>
                        </div>

                        <section className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-[#f6f9ff] to-emerald-50/40">
                          <div className="flex items-start gap-3 border-b border-blue-100 px-4 py-4 sm:px-5">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#014BAA] text-white shadow-md shadow-blue-500/15"><ShieldCheck className="h-5 w-5" /></span>
                            <div>
                              <div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold text-gray-900">Choose your response contract</h3><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-700">Required for JobX Trust</span></div>
                              <p className="mt-1 text-xs leading-5 text-gray-500">Candidates will see this deadline before applying. Every on-time update strengthens your public response score.</p>
                            </div>
                          </div>
                          <div className="grid gap-2 p-3 sm:grid-cols-3 sm:p-4">
                            {RESPONSE_COMMITMENTS.map((commitment) => {
                              const selected = form.responseCommitmentDays === commitment.days;
                              return (
                                <button
                                  type="button"
                                  key={commitment.days}
                                  onClick={() => update('responseCommitmentDays', commitment.days)}
                                  aria-pressed={selected}
                                  className={`product-focus relative rounded-xl border p-4 text-left transition-all ${selected ? 'border-[#155eef] bg-white shadow-md shadow-blue-600/10 ring-2 ring-blue-100' : 'border-blue-100 bg-white/65 hover:border-blue-200 hover:bg-white'}`}
                                >
                                  {commitment.recommended && <span className="absolute right-2.5 top-2.5 rounded-full bg-[#eef4ff] px-2 py-0.5 text-[0.6rem] font-extrabold text-[#155eef]">Recommended</span>}
                                  <p className="text-2xl font-extrabold tracking-[-0.04em] text-gray-900">{commitment.days}<span className="ml-1 text-xs font-bold tracking-normal text-gray-400">days</span></p>
                                  <p className="mt-2 text-xs font-bold text-gray-800">{commitment.label}</p>
                                  <p className="mt-1 text-[0.7rem] leading-4 text-gray-500">{commitment.description}</p>
                                  <span className={`mt-3 flex h-4 w-4 items-center justify-center rounded-full border ${selected ? 'border-[#155eef] bg-[#155eef]' : 'border-gray-300'}`}>{selected && <Check className="h-3 w-3 text-white" />}</span>
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex items-start gap-2 border-t border-blue-100 bg-white/55 px-4 py-3 text-[0.7rem] leading-5 text-gray-600 sm:px-5">
                            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#155eef]" />
                            Missing this window is recorded in your company response rate. Candidates always receive a visible outcome in their tracker.
                          </div>
                        </section>

                        {/* Application Method */}
                        <InputField label="How do candidates apply?" required>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => update('applicationType', 'easy')}
                              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                                form.applicationType === 'easy' ? 'bg-blue-50 border-[#014BAA] text-[#014BAA] shadow-sm shadow-blue-500/10' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                              }`}>
                              <Globe className="w-5 h-5" />
                              <span className="text-sm font-semibold">Easy Apply</span>
                              <span className="text-[11px] text-gray-400">Apply on JobX</span>
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => update('applicationType', 'external')}
                              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                                form.applicationType === 'external' ? 'bg-blue-50 border-[#014BAA] text-[#014BAA] shadow-sm shadow-blue-500/10' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                              }`}>
                              <ExternalLink className="w-5 h-5" />
                              <span className="text-sm font-semibold">External URL</span>
                              <span className="text-[11px] text-gray-400">Company website</span>
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => update('applicationType', 'email')}
                              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                                form.applicationType === 'email' ? 'bg-blue-50 border-[#014BAA] text-[#014BAA] shadow-sm shadow-blue-500/10' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                              }`}>
                              <Mail className="w-5 h-5" />
                              <span className="text-sm font-semibold">Email</span>
                              <span className="text-[11px] text-gray-400">Send resume to email</span>
                            </motion.button>
                          </div>
                        </InputField>

                        {(form.applicationType === 'external' || form.applicationType === 'email') && (
                          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                            <InputField label={form.applicationType === 'external' ? 'Application URL' : 'Application Email'} required error={errors.applicationValue}>
                              <div className="relative">
                                {form.applicationType === 'external' ? <ExternalLink className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /> : <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
                                <input type="text" value={form.applicationValue} onChange={(e) => update('applicationValue', e.target.value)}
                                  placeholder={form.applicationType === 'external' ? 'https://company.com/careers/apply' : 'careers@company.com'}
                                  className={`w-full bg-[#F8F3F0] rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 border outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 ${errors.applicationValue ? 'border-red-300' : 'border-gray-200 focus:border-[#014BAA]'}`} />
                              </div>
                            </InputField>
                          </motion.div>
                        )}

                        {/* Screening Questions */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-gray-700">Screening Questions</label>
                            <span className="text-xs text-gray-400">{form.screeningQuestions.length} added</span>
                          </div>
                          <p className="text-xs text-gray-400">Add questions to filter candidates before they apply</p>

                          {/* Preset questions */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {PRESET_SCREENING_QUESTIONS.map((q, i) => {
                              const alreadyAdded = form.screeningQuestions.some((sq) => sq.question === q.question);
                              return (
                                <motion.button key={i} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => !alreadyAdded && addScreeningQuestion(q)}
                                  disabled={alreadyAdded}
                                  className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                                    alreadyAdded ? 'bg-blue-50 border-blue-200 text-[#014BAA] opacity-60' : 'bg-white border-gray-200 text-gray-600 hover:border-[#014BAA] hover:text-[#014BAA]'
                                  }`}>
                                  <HelpCircle className="w-4 h-4 shrink-0" />
                                  <span className="text-xs font-medium">{q.question}</span>
                                  {alreadyAdded && <Check className="w-3.5 h-3.5 ml-auto" />}
                                </motion.button>
                              );
                            })}
                          </div>

                          {/* Custom question */}
                          <div className="flex gap-2">
                            <input type="text" value={customQuestion} onChange={(e) => setCustomQuestion(e.target.value)}
                              placeholder="Add your own question..."
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (customQuestion.trim()) { addScreeningQuestion({ question: customQuestion.trim(), type: 'text', required: false }); setCustomQuestion(''); } }}}
                              className="flex-1 bg-[#F8F3F0] rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-[#014BAA] focus:bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500/20" />
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { if (customQuestion.trim()) { addScreeningQuestion({ question: customQuestion.trim(), type: 'text', required: false }); setCustomQuestion(''); } }}
                              className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-[#014BAA] hover:text-white transition-colors text-sm font-medium"><Plus className="w-4 h-4" /></motion.button>
                          </div>

                          {/* Added questions */}
                          <AnimatePresence>
                            {form.screeningQuestions.length > 0 && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                                {form.screeningQuestions.map((q) => (
                                  <motion.div key={q.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                                    className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-200">
                                    <div className="p-1.5 rounded-lg bg-blue-50 shrink-0">
                                      {q.type === 'yesno' ? <HelpCircle className="w-4 h-4 text-[#014BAA]" /> : q.type === 'number' ? <Hash className="w-4 h-4 text-[#014BAA]" /> : <Type className="w-4 h-4 text-[#014BAA]" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-gray-800">{q.question}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[11px] text-gray-400 capitalize">{q.type}</span>
                                        {q.required && <span className="text-[11px] text-red-400 font-medium">Required</span>}
                                      </div>
                                    </div>
                                    <button onClick={() => removeScreeningQuestion(q.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </motion.div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Promotion toggle */}
                        <motion.label whileHover={{ scale: 1.005 }} className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.isPromoted ? 'bg-[#014BAA] border-[#014BAA]' : 'border-gray-300 group-hover:border-[#014BAA]'}`}>
                            {form.isPromoted && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <input type="checkbox" checked={form.isPromoted} onChange={(e) => update('isPromoted', e.target.checked)} className="hidden" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Promote this job</p>
                            <p className="text-xs text-gray-400 mt-0.5">Get 5x more views by promoting your job post</p>
                          </div>
                          <span className="ml-auto text-xs font-bold text-[#014BAA] bg-blue-50 px-2 py-1 rounded-md border border-blue-200">$50 / 30 days</span>
                        </motion.label>
                      </motion.div>
                    )}

                    {/* ===== STEP 4: REVIEW ===== */}
                    {step === 4 && (
                      <motion.div key="step4" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }} className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Eye className="w-5 h-5 text-purple-600" /></div>
                          <div>
                            <h2 className="text-lg font-bold text-gray-900">Review & Publish</h2>
                            <p className="text-xs text-gray-500">Preview how your job will appear to candidates</p>
                          </div>
                        </div>

                        {/* Job preview card */}
                        <div className="rounded-2xl border border-gray-200/80 bg-[#F8F3F0]/50 overflow-hidden">
                          <div className="p-5 sm:p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <h3 className="text-xl font-bold text-gray-900">{form.title || 'Untitled Job Posting'}</h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-500">
                                  <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-gray-400" />{form.type}</span>
                                  <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-gray-400" />{form.workplace}</span>
                                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" />{form.workplace === 'Remote' ? 'Remote' : form.location || '—'}</span>
                                  <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-gray-400" />{form.department || '—'}</span>
                                </div>
                                {form.locations.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                    <span className="text-xs text-gray-400">Also hiring in:</span>
                                    {form.locations.map((loc) => <span key={loc} className="text-xs text-[#014BAA] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{loc}</span>)}
                                  </div>
                                )}
                              </div>
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#014BAA] border border-blue-200 shrink-0">{form.experience}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                              <div className="bg-white rounded-xl p-4 border border-gray-100">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Salary Range</p>
                                <p className="text-lg font-bold text-gray-900">{form.currency} {form.salaryMin ? Number(form.salaryMin).toLocaleString() : '—'} — {form.salaryMax ? Number(form.salaryMax).toLocaleString() : '—'} <span className="text-sm font-normal text-gray-400">{form.payPeriod}</span></p>
                              </div>
                              <div className="bg-white rounded-xl p-4 border border-gray-100">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Required Skills</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {form.skills.length > 0 ? form.skills.map((s) => <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-[#014BAA] border border-blue-200">{s}</span>) : <span className="text-sm text-gray-400 italic">No skills added</span>}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Benefits preview */}
                          {form.benefits.length > 0 && (
                            <div className="px-5 sm:px-6 pb-3">
                              <div className="bg-white rounded-xl p-4 border border-gray-100">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Benefits & Perks</p>
                                <div className="flex flex-wrap gap-2">
                                  {form.benefits.map((b) => (
                                    <span key={b} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-[#014BAA] border border-blue-100">
                                      <Check className="w-3 h-3" />{b}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Description */}
                          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                            <div className="bg-white rounded-xl p-4 border border-gray-100">
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</p>
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{form.description || <span className="text-gray-400 italic">No description provided yet.</span>}</p>
                            </div>
                          </div>
                        </div>

                        {/* Application method preview */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Application Method</p>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${form.applicationType === 'easy' ? 'bg-blue-50 text-[#014BAA]' : form.applicationType === 'external' ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'}`}>
                              {form.applicationType === 'easy' ? <Globe className="w-4 h-4" /> : form.applicationType === 'external' ? <ExternalLink className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{form.applicationType === 'easy' ? 'Easy Apply on JobX' : form.applicationType === 'external' ? 'Apply on company website' : 'Apply by email'}</p>
                              {form.applicationValue && <p className="text-xs text-gray-500">{form.applicationValue}</p>}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                          <div className="flex items-start gap-3">
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-emerald-900">JobX response contract</p><span className="rounded-full bg-white px-2.5 py-1 text-xs font-extrabold text-emerald-700 shadow-sm">Answer in {form.responseCommitmentDays} days</span></div>
                              <p className="mt-1 text-xs leading-5 text-emerald-700">Candidates see the deadline before applying, and every decision contributes to your public response score.</p>
                            </div>
                          </div>
                        </div>

                        {/* Screening questions preview */}
                        {form.screeningQuestions.length > 0 && (
                          <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Screening Questions ({form.screeningQuestions.length})</p>
                            <div className="space-y-2">
                              {form.screeningQuestions.map((q, i) => (
                                <div key={q.id} className="flex items-start gap-2 text-sm text-gray-700">
                                  <span className="text-xs font-bold text-gray-400 mt-0.5">{i + 1}.</span>
                                  <span>{q.question} <span className="text-xs text-gray-400">({q.type}{q.required ? ', required' : ''})</span></span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Promotion preview */}
                        {form.isPromoted && (
                          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <TrendingUp className="w-5 h-5 text-[#014BAA] shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-[#014BAA]">Promoted Job</p>
                                <p className="text-xs text-blue-500 mt-1">Your job will receive priority placement and 5x more visibility. Billed $50 for 30 days.</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Publishing tips */}
                        <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-blue-800">Ready to go live?</p>
                              <p className="text-xs text-blue-500 mt-1 leading-relaxed">
                                Your verified job will be visible immediately with a {form.responseCommitmentDays}-day response contract. You can reconfirm, edit or close it anytime from My Posts.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Footer actions */}
                  <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                    <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.98 }} onClick={back} disabled={step === 1}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </motion.button>

                    {step < 4 ? (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={next}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#014BAA] hover:bg-[#013b86] shadow-lg shadow-blue-500/20 transition-all">
                        Next Step <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveDraft}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-[#F8F3F0] transition-colors">
                          <Save className="w-4 h-4" /> Save as Draft
                        </motion.button>
                        <CustomTooltip content="Publish and make visible to candidates" position="top">
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePublish}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#014BAA] hover:bg-[#013b86] shadow-lg shadow-blue-500/20 transition-all">
                            <Globe className="w-4 h-4" /> Publish Now
                          </motion.button>
                        </CustomTooltip>
                      </div>
                    )}
                  </div>
                </div>
              </SpotlightCard>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* ===== MODALS ===== */}

      {/* Repost Modal */}
      <AnimatedModal isOpen={showRepostModal} onClose={() => setShowRepostModal(false)} title="Repost from Existing Job" size="md">
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Select a previous job post to copy details from:</p>
          {existingJobs.map((job) => (
            <motion.button key={job.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => repostFromExisting(job.title)}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-[#014BAA] hover:bg-blue-50/30 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Briefcase className="w-5 h-5 text-[#014BAA]" /></div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                <p className="text-xs text-gray-400">Copy title, description, and settings</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
            </motion.button>
          ))}
        </div>
      </AnimatedModal>

      {/* Save draft modal */}
      <AnimatedModal isOpen={showDraftModal} onClose={() => setShowDraftModal(false)} title="Save as Draft" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-amber-50/60 border border-amber-100 rounded-xl p-4">
            <Save className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Save for later</p>
              <p className="text-xs text-amber-600 mt-1">Your job post will be saved as a draft. You can edit and publish it anytime from My Posts.</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setShowDraftModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={confirmDraft}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors"><Save className="w-4 h-4 inline mr-1" /> Save Draft</motion.button>
          </div>
          {saveError && <p role="alert" className="text-sm text-red-600">{saveError}</p>}
        </div>
      </AnimatedModal>

      {/* Publish confirmation modal */}
      <AnimatedModal isOpen={showPublishModal} onClose={() => setShowPublishModal(false)} title="Publish Job Post" size="md">
        <div className="space-y-5">
          <div className="flex items-start gap-3 bg-blue-50/60 border border-blue-100 rounded-xl p-4">
            <Globe className="w-5 h-5 text-[#014BAA] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#014BAA]">Ready to publish?</p>
              <p className="text-xs text-blue-500 mt-1">Your job will be live and visible to all candidates immediately.</p>
            </div>
          </div>

          <div className="bg-[#F8F3F0] rounded-xl p-4 border border-gray-100 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Job Title</span><span className="font-medium text-gray-900">{form.title || 'Untitled'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Workplace</span><span className="font-medium text-gray-900">{form.workplace}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium text-gray-900">{form.type}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Salary</span><span className="font-medium text-gray-900">{form.currency} {form.salaryMin ? Number(form.salaryMin).toLocaleString() : '—'} — {form.salaryMax ? Number(form.salaryMax).toLocaleString() : '—'} {form.payPeriod}</span></div>
            {form.isPromoted && <div className="flex justify-between"><span className="text-gray-500">Promotion</span><span className="font-medium text-[#014BAA]">Promoted ($50)</span></div>}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setShowPublishModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Go Back</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={confirmPublish}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#014BAA] hover:bg-[#013b86] shadow-lg shadow-blue-500/20 transition-all"><Globe className="w-4 h-4" /> Publish Now</motion.button>
          </div>
          {saveError && <p role="alert" className="text-sm text-red-600">{saveError}</p>}
        </div>
      </AnimatedModal>
    </div>
  );
}
