import { CheckCircle2, Code2, ExternalLink, Github, Image, Users, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { PROJECT_CATEGORIES, projectService, type CommunityProject, type ProjectSubmission } from '../services/projectService';
import type { User } from '../services/userService';

interface SubmitProjectModalProps {
  user: User;
  onClose: () => void;
  onSubmitted: (project: CommunityProject) => void;
}

const INITIAL_FORM: ProjectSubmission = {
  title: '',
  description: '',
  tags: [],
  imageUrl: '',
  repositoryUrl: '',
  demoUrl: '',
  openToCollab: true,
  category: 'Web Apps',
};

export default function SubmitProjectModal({ user, onClose, onSubmitted }: SubmitProjectModalProps) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTags = () => {
    const nextTags = tagInput.split(',').map((tag) => tag.trim()).filter(Boolean);
    if (!nextTags.length) return;
    setForm((current) => ({ ...current, tags: [...new Set([...current.tags, ...nextTags])].slice(0, 6) }));
    setTagInput('');
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = projectService.submit({ ...form, tags: [...form.tags, ...tagInput.split(',')] }, user);
    setIsSubmitting(false);

    if (!result.success || !result.project) {
      setError(result.error || 'We could not submit your project. Please try again.');
      return;
    }

    onSubmitted(result.project);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="submit-project-title">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl dark:bg-slate-950">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6 dark:border-slate-800 dark:bg-slate-950/95">
          <div>
            <p className="product-eyebrow">Portfolio evidence</p>
            <h2 id="submit-project-title" className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-slate-900 dark:text-white">Share a project</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Show the work, decisions, and skills behind it.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close project submission" className="product-focus rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">
          {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{error}</div>}

          <label className="block"><span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Project title <span className="text-red-500">*</span></span><input required minLength={3} maxLength={80} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. JobX portfolio case study" className="product-focus mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#155eef] dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></label>

          <label className="block"><span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Category <span className="text-red-500">*</span></span><select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as ProjectSubmission['category'] }))} className="product-focus mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#155eef] dark:border-slate-700 dark:bg-slate-900 dark:text-white">{PROJECT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>

          <label className="block"><span className="flex items-center justify-between text-sm font-extrabold text-slate-800 dark:text-slate-100"><span>What did you build? <span className="text-red-500">*</span></span><span className="text-xs font-semibold text-slate-400">{form.description.length}/1000</span></span><textarea required minLength={30} maxLength={1000} rows={5} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Explain the problem, your contribution, and the outcome. Clear context makes the work easier to evaluate." className="product-focus mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#155eef] dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></label>

          <div><span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Skills and technologies <span className="text-red-500">*</span></span><div className="mt-2 flex gap-2"><div className="relative flex-1"><Code2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={tagInput} onChange={(event) => setTagInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addTags(); } }} placeholder="React, TypeScript, Figma" className="product-focus min-h-11 w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#155eef] dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></div><button type="button" onClick={addTags} className="product-button-secondary product-focus px-3 text-sm">Add</button></div><div className="mt-2 flex flex-wrap gap-2">{form.tags.map((tag) => <button key={tag} type="button" onClick={() => setForm((current) => ({ ...current, tags: current.tags.filter((item) => item !== tag) }))} className="product-focus inline-flex items-center gap-1 rounded-md border border-blue-200 bg-[#eef4ff] px-2 py-1 text-xs font-bold text-[#0c3e9e] dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200">{tag}<X className="h-3 w-3" /></button>)}</div><p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">Up to 6 skills. Press Enter or use commas to add more.</p></div>

          <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="flex items-center gap-1.5 text-sm font-extrabold text-slate-800 dark:text-slate-100"><Github className="h-4 w-4" /> Repository URL</span><input type="url" value={form.repositoryUrl} onChange={(event) => setForm((current) => ({ ...current, repositoryUrl: event.target.value }))} placeholder="https://github.com/..." className="product-focus mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#155eef] dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></label><label className="block"><span className="flex items-center gap-1.5 text-sm font-extrabold text-slate-800 dark:text-slate-100"><ExternalLink className="h-4 w-4" /> Live demo URL</span><input type="url" value={form.demoUrl} onChange={(event) => setForm((current) => ({ ...current, demoUrl: event.target.value }))} placeholder="https://your-project.com" className="product-focus mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#155eef] dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></label></div>

          <label className="block"><span className="flex items-center gap-1.5 text-sm font-extrabold text-slate-800 dark:text-slate-100"><Image className="h-4 w-4" /> Cover image URL <span className="font-medium text-slate-400">(optional)</span></span><input type="url" value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="https://images.example.com/project-cover.jpg" className="product-focus mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#155eef] dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></label>

          <button type="button" aria-pressed={form.openToCollab} onClick={() => setForm((current) => ({ ...current, openToCollab: !current.openToCollab }))} className={`product-focus flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-colors ${form.openToCollab ? 'border-blue-200 bg-[#eef4ff] dark:border-blue-900 dark:bg-blue-950/40' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'}`}><span className="flex items-start gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${form.openToCollab ? 'bg-white text-[#155eef] dark:bg-slate-900 dark:text-blue-200' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}><Users className="h-4 w-4" /></span><span><span className="block text-sm font-extrabold text-slate-900 dark:text-white">Open to collaboration</span><span className="mt-0.5 block text-xs leading-5 font-medium text-slate-500 dark:text-slate-400">Let people know you are open to relevant collaborators.</span></span></span>{form.openToCollab && <CheckCircle2 className="h-5 w-5 text-[#155eef]" />}</button>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end dark:border-slate-800"><button type="button" onClick={onClose} className="product-button-secondary product-focus px-4">Cancel</button><button type="submit" disabled={isSubmitting} className="product-button-primary product-focus px-5 disabled:cursor-wait disabled:opacity-70">{isSubmitting ? 'Submitting…' : 'Submit project'}</button></div>
        </form>
      </motion.div>
    </div>
  );
}
