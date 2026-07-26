import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Bot, CheckCircle2, FileCheck2, FileText, Map, MessageSquareText, PenLine, RotateCcw, Send, Sparkles, Target, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import { formatResumeFileSize, readResumeText, validateResumeFile } from '../services/resumeUploadService';

type Roadmap = {
  role: string;
  category: string;
  duration: string;
  demand: string;
  summary: string;
  steps: Array<{ title: string; detail: string; skills: string[] }>;
  questions: string[];
};

const SHARED_INTERVIEW_QUESTIONS = [
  'Tell me about a time priorities changed suddenly. How did you respond?',
  'Describe a mistake you made, what you learned, and what you changed afterward.',
  'How have you handled disagreement with a stakeholder or teammate?',
  'Tell me about an ambiguous problem you turned into a clear plan.',
  'How do you protect quality when a deadline is under pressure?',
  'Describe feedback that changed the way you work.',
  'What would you prioritize in your first 90 days as a {role}?',
];

const ROADMAPS: Roadmap[] = [
  ['Full Stack Developer', 'Engineering', '6–9 months', 'High', 'Build reliable products across frontend, backend, data, and deployment.', ['Web foundations|Master semantic HTML, modern CSS, JavaScript, Git, and accessibility.|HTML,CSS,JavaScript,Git', 'Frontend systems|Build typed React applications with testing and state management.|React,TypeScript,Testing', 'Backend APIs|Design secure APIs, authentication, and database models.|Node.js,REST,SQL', 'Cloud delivery|Containerize, deploy, monitor, and automate delivery.|Docker,AWS,CI/CD', 'Portfolio proof|Ship two production-quality projects and document trade-offs.|Architecture,Documentation,Collaboration'], ['Tell me about a full-stack feature you owned end to end.', 'How would you design an authenticated API that handles rapid growth?', 'Describe a production incident and how you diagnosed it.']],
  ['Frontend Engineer', 'Engineering', '4–7 months', 'High', 'Create fast, accessible, maintainable web experiences.', ['Web platform|Strengthen browser, HTML, CSS, and JavaScript fundamentals.|JavaScript,CSS,A11y', 'Component architecture|Build reusable typed components and design systems.|React,TypeScript,Storybook', 'Quality|Practice unit, integration, and end-to-end testing.|Vitest,Playwright,Testing', 'Performance|Measure and improve loading, rendering, and responsiveness.|Web Vitals,Profiling,SEO', 'Portfolio|Publish an accessible product with clear engineering notes.|GitHub,Documentation,Deployment'], ['How do you decide where state should live in a React application?', 'Explain how you would improve a slow product page.', 'Tell me about an accessibility issue you found and fixed.']],
  ['Backend Engineer', 'Engineering', '5–8 months', 'High', 'Design dependable APIs, data systems, and distributed services.', ['Programming depth|Build fluency in one backend language and testing.|Node.js,Python,Testing', 'Data modeling|Design relational schemas, indexes, and migrations.|SQL,PostgreSQL,Redis', 'API design|Create secure, versioned, observable service contracts.|REST,Auth,OpenAPI', 'Distributed systems|Learn queues, caching, retries, and failure handling.|Queues,Caching,Observability', 'System proof|Build and load-test a production-style service.|Docker,Cloud,CI/CD'], ['Design a notification service that must not lose messages.', 'When would you choose SQL over a document database?', 'How do you make API retries safe?']],
  ['Product Designer', 'Design', '4–6 months', 'High', 'Turn research and product strategy into clear, inclusive experiences.', ['Research|Plan interviews and synthesize actionable insights.|Research,Interviews,Synthesis', 'Interaction design|Map flows, information architecture, and edge cases.|User flows,Wireframes,IA', 'Visual systems|Create accessible interfaces and reusable components.|Figma,Design systems,A11y', 'Validation|Prototype and test assumptions with users.|Prototyping,Usability testing,Analytics', 'Case studies|Publish two outcome-focused case studies.|Storytelling,Metrics,Portfolio'], ['Walk me through a design decision that changed after research.', 'How do you handle conflicting stakeholder feedback?', 'Describe how you measure whether a design succeeded.']],
  ['Data Analyst', 'Data', '3–6 months', 'High', 'Translate messy data into trustworthy decisions and narratives.', ['Analytics foundations|Practice spreadsheets, SQL, and statistics.|SQL,Statistics,Excel', 'Data preparation|Clean, join, validate, and document datasets.|Python,Pandas,Data quality', 'Visualization|Build clear dashboards around business questions.|Tableau,Power BI,Storytelling', 'Experimentation|Understand funnels, cohorts, and A/B tests.|Experimentation,Metrics,Analytics', 'Portfolio|Publish three reproducible business analyses.|Documentation,GitHub,Presentation'], ['How would you investigate a sudden conversion-rate drop?', 'Explain a dashboard you built and the decision it changed.', 'How do you validate that your analysis is correct?']],
  ['Data Scientist', 'Data', '7–12 months', 'High', 'Develop useful, responsible models from exploration through deployment.', ['Mathematics and code|Build Python, statistics, and linear algebra fluency.|Python,Statistics,NumPy', 'Machine learning|Train, validate, and compare supervised models.|Scikit-learn,ML,Evaluation', 'Data systems|Create reproducible feature and experiment pipelines.|SQL,Pandas,MLOps', 'Responsible AI|Assess bias, explainability, privacy, and drift.|Fairness,Explainability,Monitoring', 'Applied proof|Deploy one model with a model card and monitoring.|FastAPI,Docker,Cloud'], ['How do you know whether a model is good enough to ship?', 'Describe how you would handle class imbalance.', 'How would you detect model drift in production?']],
  ['DevOps Engineer', 'Engineering', '5–9 months', 'High', 'Automate secure, observable infrastructure and delivery systems.', ['Linux and networking|Build strong operating-system and network fundamentals.|Linux,Networking,Bash', 'Infrastructure as code|Provision repeatable cloud environments.|Terraform,AWS,IaC', 'Containers|Operate containerized workloads and orchestration.|Docker,Kubernetes,Helm', 'Delivery and security|Build secure CI/CD with policy and secrets management.|CI/CD,Security,GitHub Actions', 'Reliability proof|Instrument and operate a service against SLOs.|Observability,SRE,Incident response'], ['How would you debug a Kubernetes service that cannot receive traffic?', 'Describe a safe deployment and rollback strategy.', 'What signals would you use to define an SLO?']],
  ['Cybersecurity Analyst', 'Security', '5–8 months', 'High', 'Identify threats, investigate incidents, and strengthen defensive controls.', ['Security foundations|Learn networks, operating systems, and threat models.|Networking,Linux,Threat modeling', 'Detection|Query logs and build meaningful detection rules.|SIEM,Logs,Detection', 'Incident response|Practice triage, containment, and evidence handling.|IR,Forensics,Playbooks', 'Cloud security|Assess identity, configuration, and data exposure.|IAM,Cloud,Security controls', 'Portfolio|Document labs and a complete incident investigation.|Documentation,MITRE ATT&CK,Reporting'], ['Walk me through your first 30 minutes of an incident.', 'How do you distinguish a true positive from noise?', 'Explain least privilege to a nontechnical stakeholder.']],
  ['Product Manager', 'Product', '4–7 months', 'High', 'Connect customer problems, strategy, delivery, and measurable outcomes.', ['Customer insight|Run discovery and define valuable problems.|Discovery,Research,JTBD', 'Product strategy|Create outcomes, positioning, and prioritization logic.|Strategy,Prioritization,OKRs', 'Delivery|Write clear requirements and lead cross-functional execution.|Roadmaps,Agile,Communication', 'Measurement|Define success metrics and learn from experiments.|Analytics,Experiments,Metrics', 'Product proof|Publish a product teardown and launch case study.|Storytelling,Leadership,Portfolio'], ['Tell me about a roadmap decision where you said no.', 'How do you define success for a new feature?', 'Describe a disagreement with engineering or design.']],
  ['Growth Marketer', 'Marketing', '3–6 months', 'Medium', 'Build measurable acquisition, activation, and retention programs.', ['Customer and channel|Define audiences, positioning, and channel economics.|Positioning,Research,CAC', 'Content and campaigns|Create a repeatable campaign and content system.|Content,Copywriting,Campaigns', 'Lifecycle|Design onboarding, email, and retention journeys.|CRM,Email,Retention', 'Experimentation|Plan tests with clear hypotheses and measurement.|A/B testing,Analytics,CRO', 'Growth proof|Publish a campaign case study with real metrics.|Dashboards,Attribution,Portfolio'], ['Describe a growth experiment that failed and what you learned.', 'How would you improve activation for a new product?', 'How do you choose between paid and organic channels?']],
].map(([role, category, duration, demand, summary, rawSteps, questions]) => ({
  role: role as string, category: category as string, duration: duration as string, demand: demand as string, summary: summary as string,
  steps: (rawSteps as string[]).map((step) => { const [title, detail, skillList] = step.split('|'); return { title, detail, skills: skillList.split(',') }; }),
  questions: [
    ...(questions as string[]),
    ...SHARED_INTERVIEW_QUESTIONS.map((question) => question.replace('{role}', role as string)),
  ],
}));

const PROGRESS_KEY = 'ai_assistant_roadmap_progress';

export default function CareerCoach() {
  const [mode, setMode] = useState<'roadmap' | 'interview' | 'resume' | 'application'>('roadmap');
  const [selectedRole, setSelectedRole] = useState(ROADMAPS[0].role);
  const [completed, setCompleted] = useState<string[]>(() => db.get<string[]>(PROGRESS_KEY, []));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ score: number; text: string } | null>(null);
  const roadmap = useMemo(() => ROADMAPS.find((item) => item.role === selectedRole) || ROADMAPS[0], [selectedRole]);
  const roleProgress = roadmap.steps.filter((_, index) => completed.includes(`${roadmap.role}-${index}`)).length;

  const toggleStep = (index: number) => {
    const id = `${roadmap.role}-${index}`;
    const next = completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id];
    setCompleted(next); db.set(PROGRESS_KEY, next);
  };

  const evaluateAnswer = () => {
    const words = answer.trim().split(/\s+/).filter(Boolean).length;
    const hasStructure = /\b(situation|task|action|result|first|then|finally)\b/i.test(answer);
    const hasEvidence = /\d|%|\bmetric|result|impact|improved|reduced|increased\b/i.test(answer);
    const score = Math.min(94, 42 + Math.min(28, Math.floor(words / 3)) + (hasStructure ? 12 : 0) + (hasEvidence ? 12 : 0));
    setFeedback({ score, text: `${hasStructure ? 'Your answer has a clear structure. ' : 'Use a Situation–Task–Action–Result structure. '}${hasEvidence ? 'The evidence makes your impact credible.' : 'Add a number, result, or concrete decision to strengthen it.'}` });
  };

  const changeRole = (role: string) => { setSelectedRole(role); setQuestionIndex(0); setAnswer(''); setFeedback(null); };

  return (
    <div className="product-page -mx-4 min-h-[calc(100vh-4rem)] px-4 py-7 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="product-shell max-w-7xl">
        <Link to="/dashboard" className="product-button-secondary mb-5"><ArrowLeft className="h-4 w-4" />Back to workspace</Link>
        <header className="overflow-hidden rounded-3xl bg-[#12213a] p-7 text-white sm:p-9">
          <div className="flex flex-wrap items-start justify-between gap-6"><div className="max-w-3xl"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#b7ff3c]"><Sparkles className="h-4 w-4" />Personal career intelligence</p><h1 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">AI Assistant for your career</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">Plan your next role, upload and improve your resume, practice deeper interviews, and prepare truthful applications from one focused workspace.</p></div><span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/20"><Bot className="h-9 w-9 text-[#b7ff3c]" /></span></div>
          <div className="mt-7 flex flex-wrap gap-3 text-xs font-bold text-slate-200"><span className="rounded-full bg-white/10 px-3 py-2">Career Passport aware</span><span className="rounded-full bg-white/10 px-3 py-2">Role-specific coaching</span><span className="rounded-full bg-white/10 px-3 py-2">Evidence-first guidance</span><span className="rounded-full bg-white/10 px-3 py-2">Progress saved</span></div>
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['roadmap', 'Career roadmap', 'Build a phased learning plan.', <Map />],
            ['interview', 'AI interview', 'Practice 10 role questions.', <MessageSquareText />],
            ['resume', 'Resume copilot', 'Upload and improve your resume.', <FileText />],
            ['application', 'Application writer', 'Draft tailored responses.', <PenLine />],
          ].map(([key, title, detail, icon]) => <button key={key as string} onClick={() => setMode(key as typeof mode)} className={`product-surface product-card-interactive p-4 text-left ${mode === key ? 'ring-2 ring-[#173b67]' : ''}`}><span className={`flex h-10 w-10 items-center justify-center rounded-xl [&>svg]:h-5 [&>svg]:w-5 ${mode === key ? 'bg-[#173b67] text-[#b7ff3c]' : 'bg-[#edf2f7] text-[#173b67]'}`}>{icon}</span><strong className="mt-3 block text-sm text-slate-900">{title}</strong><small className="mt-1 block leading-5 text-slate-500">{detail}</small></button>)}
        </section>

        <section className="mt-6 grid gap-4 rounded-2xl bg-[#12213a] p-5 text-white sm:grid-cols-[1fr_auto] sm:items-end sm:p-6">
          <div><label htmlFor="career-role" className="text-xs font-black uppercase tracking-[0.12em] text-blue-200">Target career</label><select id="career-role" value={selectedRole} onChange={(event) => changeRole(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-white/10 px-4 text-base font-extrabold text-white outline-none sm:max-w-xl">{ROADMAPS.map((item) => <option key={item.role} value={item.role} className="text-slate-900">{item.role} · {item.category}</option>)}</select><p className="mt-3 text-sm text-slate-300">{roadmap.summary}</p></div>
          <div className="flex gap-3 text-sm"><span className="rounded-xl bg-white/10 px-4 py-3"><strong className="block text-lg">{roadmap.duration}</strong><span className="text-slate-300">Estimated path</span></span><span className="rounded-xl bg-[#b7ff3c] px-4 py-3 text-[#12213a]"><strong className="block text-lg">{roadmap.demand}</strong><span className="font-semibold">Market demand</span></span></div>
        </section>

        {mode === 'roadmap' ? (
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <section className="product-surface overflow-hidden"><div className="border-b border-slate-100 p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><div><p className="product-eyebrow">Personalized plan</p><h2 className="mt-2 text-2xl font-black text-slate-950">{roadmap.role} roadmap</h2></div><strong className="text-sm text-slate-500">{roleProgress}/{roadmap.steps.length} complete</strong></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#b7ff3c] transition-all" style={{ width: `${roleProgress / roadmap.steps.length * 100}%` }} /></div></div>
              <ol className="divide-y divide-slate-100">{roadmap.steps.map((step, index) => { const done = completed.includes(`${roadmap.role}-${index}`); return <li key={step.title} className="p-5 sm:p-6"><div className="flex gap-4"><button onClick={() => toggleStep(index)} aria-label={`${done ? 'Mark incomplete' : 'Complete'} ${step.title}`} className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${done ? 'border-[#b7ff3c] bg-[#b7ff3c] text-[#12213a]' : 'border-slate-300 text-slate-400'}`}>{done ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-xs font-black">{index + 1}</span>}</button><div><p className="text-xs font-black uppercase tracking-[0.1em] text-slate-400">Phase {index + 1}</p><h3 className={`mt-1 text-lg font-black ${done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{step.detail}</p><div className="mt-3 flex flex-wrap gap-2">{step.skills.map((skill) => <span key={skill} className="rounded-lg bg-[#edf2f7] px-2.5 py-1 text-xs font-bold text-[#173b67]">{skill}</span>)}</div></div></div></li>; })}</ol>
            </section>
            <aside className="space-y-4"><section className="product-surface p-5"><Bot className="h-6 w-6 text-[#173b67]" /><h2 className="mt-3 text-lg font-black">AI coach guidance</h2><p className="mt-2 text-sm leading-6 text-slate-600">Start with the first incomplete phase. Build one visible piece of evidence before moving to the next skill group.</p><button onClick={() => setMode('interview')} className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#173b67]">Practice this role <ArrowRight className="h-4 w-4" /></button></section><section className="rounded-2xl bg-[#fcf0f5] p-5"><Target className="h-5 w-5 text-[#173b67]" /><h2 className="mt-3 font-black text-slate-900">{ROADMAPS.length} sample career paths</h2><p className="mt-2 text-sm leading-6 text-slate-600">Switch careers anytime. Progress is saved separately for every roadmap.</p></section></aside>
          </div>
        ) : mode === 'interview' ? (
          <section className="product-surface mt-5 overflow-hidden">
            <div className="grid lg:grid-cols-[18rem_minmax(0,1fr)]">
              <aside className="border-b border-slate-200 bg-slate-50 p-5 lg:border-b-0 lg:border-r"><p className="product-eyebrow">Interview plan</p><h2 className="mt-3 text-xl font-black">{roadmap.role}</h2><p className="mt-2 text-sm text-slate-500">{questionIndex + 1} of {roadmap.questions.length} questions</p><div className="mt-5 max-h-[36rem] space-y-2 overflow-y-auto pr-1">{roadmap.questions.map((question, index) => <button key={question} onClick={() => { setQuestionIndex(index); setAnswer(''); setFeedback(null); }} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm font-bold ${questionIndex === index ? 'bg-[#173b67] text-white' : 'bg-white text-slate-600'}`}><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs">{index + 1}</span><span className="line-clamp-2">{question}</span></button>)}</div></aside>
              <div className="p-5 sm:p-8"><div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#173b67] text-[#b7ff3c]"><Bot className="h-6 w-6" /></span><div><p className="text-xs font-black uppercase tracking-[0.1em] text-slate-400">AI interviewer</p><h2 className="mt-1 text-xl font-black leading-7 text-slate-950">{roadmap.questions[questionIndex]}</h2></div></div><label className="mt-7 block"><span className="text-sm font-extrabold text-slate-700">Your answer</span><textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows={8} placeholder="Answer naturally. Include context, your decisions, actions, and a measurable result where possible." className="mt-2 w-full rounded-xl border border-slate-200 p-4 text-sm leading-6 outline-none focus:border-[#173b67] focus:ring-4 focus:ring-[#173b67]/10" /></label><div className="mt-4 flex flex-wrap gap-3"><button disabled={answer.trim().length < 20} onClick={evaluateAnswer} className="product-button-primary disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-4 w-4" />Get AI feedback</button><button onClick={() => { setAnswer(''); setFeedback(null); }} className="product-button-secondary"><RotateCcw className="h-4 w-4" />Start again</button></div>{feedback && <div className="mt-6 rounded-2xl border border-[#b7ff3c] bg-[#f2ffd9] p-5"><div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-sm font-black text-[#24451c]"><Sparkles className="h-4 w-4" />Interview feedback</span><strong className="text-2xl font-black text-[#173b67]">{feedback.score}/100</strong></div><p className="mt-3 text-sm leading-6 text-slate-700">{feedback.text}</p><button onClick={() => { setQuestionIndex((questionIndex + 1) % roadmap.questions.length); setAnswer(''); setFeedback(null); }} className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#173b67]">Next question <ArrowRight className="h-4 w-4" /></button></div>}</div>
            </div>
          </section>
        ) : <CandidateAITool mode={mode} role={roadmap.role} roadmap={roadmap} />}
      </div>
    </div>
  );
}

function CandidateAITool({ mode, role, roadmap }: { mode: 'resume' | 'application'; role: string; roadmap: Roadmap }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState(mode === 'resume' ? 'Built and maintained web applications for customers.' : '');
  const [job, setJob] = useState(`${role} role requiring collaboration, measurable delivery, and strong ${roadmap.steps[0].skills.slice(0, 2).join(' and ')} skills.`);
  const [generated, setGenerated] = useState(false);
  const [uploadedResume, setUploadedResume] = useState<{ name: string; size: number } | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const wordCount = input.trim().split(/\s+/).filter(Boolean).length;
  const metricCount = (input.match(/\b\d+(?:[.,]\d+)?(?:%|\+|x)?\b/g) || []).length;
  const hasActionLanguage = /\b(built|created|delivered|designed|developed|drove|improved|increased|launched|led|optimized|reduced|shipped)\b/i.test(input);

  const handleResumeUpload = async (file: File | undefined) => {
    if (!file) return;
    setGenerated(false);
    const error = validateResumeFile(file);
    if (error) {
      setUploadedResume(null);
      setUploadMessage(null);
      setUploadError(error);
      return;
    }

    setUploadedResume({ name: file.name, size: file.size });
    setUploadError(null);
    try {
      const importedText = await readResumeText(file);
      if (importedText) {
        setInput(importedText);
        setUploadMessage('Resume text imported and ready for Copilot review.');
      } else {
        setUploadMessage('Resume uploaded. Paste the section you want rewritten below for line-by-line guidance.');
      }
    } catch {
      setUploadMessage(null);
      setUploadError('The resume was selected, but its text could not be read. Try a TXT version or paste the content below.');
    }
  };

  const title = mode === 'resume' ? 'Resume copilot' : 'Application writer';
  const copy = mode === 'resume'
    ? 'Upload your resume, review its evidence signals, and strengthen unclear statements.'
    : 'Draft a tailored, truthful response grounded in your demonstrated work.';
  const icon = mode === 'resume' ? <FileText className="h-5 w-5" /> : <PenLine className="h-5 w-5" />;
  return (
    <section className="product-surface mt-5 overflow-hidden">
      <div className="border-b border-slate-100 p-6">
        <div className="flex items-start gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fcf0f5] text-[#173b67]">{icon}</span><div><h2 className="text-xl font-black text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{copy}</p></div></div>
      </div>
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <div>
          {mode === 'resume' && (
            <div className="mb-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="sr-only"
                aria-label="Upload resume"
                onChange={(event) => {
                  void handleResumeUpload(event.target.files?.[0]);
                  event.currentTarget.value = '';
                }}
              />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#173b67] shadow-sm">{uploadedResume ? <FileCheck2 className="h-5 w-5" /> : <Upload className="h-5 w-5" />}</span>
                  <div>
                    <p className="text-sm font-black text-slate-900">{uploadedResume ? uploadedResume.name : 'Upload your resume'}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{uploadedResume ? formatResumeFileSize(uploadedResume.size) : 'PDF, DOC, DOCX, or TXT · maximum 5 MB'}</p>
                  </div>
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="product-button-secondary shrink-0"><Upload className="h-4 w-4" />{uploadedResume ? 'Replace file' : 'Choose file'}</button>
              </div>
              {uploadMessage && <p role="status" className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold leading-5 text-emerald-700">{uploadMessage}</p>}
              {uploadError && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold leading-5 text-red-700">{uploadError}</p>}
            </div>
          )}

          <label className="block">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">{mode === 'resume' ? 'Resume content or statement' : 'Your relevant experience'}</span>
            <textarea value={input} onChange={(event) => { setInput(event.target.value); setGenerated(false); }} rows={8} placeholder="Add truthful experience, outcomes, and examples…" className="mt-2 w-full rounded-xl border border-slate-200 p-4 text-sm leading-6 outline-none focus:border-[#173b67]" />
          </label>
          {mode === 'application' && <label className="mt-4 block"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Target opportunity</span><textarea value={job} onChange={(event) => { setJob(event.target.value); setGenerated(false); }} rows={5} className="mt-2 w-full rounded-xl border border-slate-200 p-4 text-sm leading-6 outline-none focus:border-[#173b67]" /></label>}
          <button disabled={input.trim().length < 20} onClick={() => setGenerated(true)} className="product-button-primary mt-5 disabled:cursor-not-allowed disabled:opacity-40"><Sparkles className="h-4 w-4" />{mode === 'resume' ? 'Review resume' : 'Generate guidance'}</button>
        </div>

        <div>
          {generated ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
              <p className="text-xs font-black uppercase tracking-wider text-[#173b67]">AI recommendation</p>
              {mode === 'resume' ? (
                <>
                  <h3 className="mt-3 font-black text-slate-950">{uploadedResume ? `${uploadedResume.name} review` : 'Resume statement review'}</h3>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <span className="rounded-xl bg-white p-3"><strong className="block text-lg text-[#173b67]">{wordCount}</strong><small className="text-slate-500">Words reviewed</small></span>
                    <span className="rounded-xl bg-white p-3"><strong className="block text-lg text-[#173b67]">{metricCount}</strong><small className="text-slate-500">Metrics found</small></span>
                    <span className="rounded-xl bg-white p-3"><strong className="block text-lg text-[#173b67]">{hasActionLanguage ? 'Yes' : 'No'}</strong><small className="text-slate-500">Action language</small></span>
                  </div>
                  <h4 className="mt-5 font-black text-slate-950">Copilot guidance</h4>
                  <p className="mt-2">{hasActionLanguage ? 'Your resume uses clear ownership language. ' : 'Start key bullets with a concrete action verb. '}{metricCount ? 'Keep the measurable results and connect each one to the action that produced it.' : 'Add a truthful measure such as scope, users served, time saved, quality gained, or delivery speed.'}</p>
                  <p className="mt-3 rounded-xl bg-white p-4"><strong>Stronger pattern:</strong> Delivered [specific work] using [method or tool], resulting in [truthful measurable outcome].</p>
                </>
              ) : (
                <>
                  <h3 className="mt-3 font-black text-slate-950">Tailored application response</h3>
                  <p className="mt-2">I’m interested in this {role} opportunity because it combines practical delivery with thoughtful collaboration. My experience includes the work described above, and I’m continuing to build verified evidence through role-specific projects. I would welcome the opportunity to discuss the decisions, contributions, and results behind that work.</p>
                </>
              )}
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><Bot className="h-9 w-9 text-slate-300" /><p className="mt-4 max-w-sm text-sm text-slate-500">{mode === 'resume' ? 'Upload a resume or paste its content to receive evidence-focused feedback.' : 'Provide your context and generate personalized, evidence-first guidance.'}</p></div>
          )}
        </div>
      </div>
    </section>
  );
}
