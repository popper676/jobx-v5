import { ArrowRight, BadgeCheck, ExternalLink, FolderGit2, Plus, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CommunityProject } from '../services/projectService';
import { getProofCoverage, getSkillProofs } from '../services/trustService';
import type { User } from '../services/userService';

interface SkillProofPanelProps {
  user: User;
  projects: CommunityProject[];
  onAddSkills: () => void;
}

export default function SkillProofPanel({ user, projects, onAddSkills }: SkillProofPanelProps) {
  const proofs = getSkillProofs(user, projects);
  const coverage = getProofCoverage(user, projects);
  const verifiedCount = proofs.filter((proof) => proof.verified).length;

  return (
    <section className="product-surface overflow-hidden" aria-labelledby="skill-proof-title">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-[#155eef] dark:bg-blue-950/60 dark:text-blue-200"><FolderGit2 className="h-5 w-5" /></span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#155eef]">Proof of work</p>
            <h2 id="skill-proof-title" className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-slate-900 dark:text-white">Skills people can verify.</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Connect each skill to a project, repository or live result—not just an endorsement.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
          <div className="text-right"><p className="text-2xl font-extrabold tracking-[-0.04em] text-slate-900 dark:text-white">{coverage}%</p><p className="text-[0.68rem] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Evidence coverage</p></div>
          <ShieldCheck className={`h-6 w-6 ${coverage >= 60 ? 'text-emerald-600' : 'text-[#155eef]'}`} />
        </div>
      </div>

      {!proofs.length ? (
        <div className="px-6 py-10 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800"><Plus className="h-5 w-5" /></span>
          <h3 className="mt-4 text-sm font-extrabold text-slate-900 dark:text-white">Start with your strongest skills</h3>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">Add the skills you use in real work, then connect them to projects as evidence.</p>
          <button type="button" onClick={onAddSkills} className="product-button-primary product-focus mt-5">Add skills <ArrowRight className="h-4 w-4" /></button>
        </div>
      ) : (
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{verifiedCount} of {proofs.length} skills have project evidence</p>
            <button type="button" onClick={onAddSkills} className="product-focus rounded-lg px-2 py-1 text-xs font-extrabold text-[#155eef] hover:bg-blue-50 dark:hover:bg-blue-950/50">Edit skills</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {proofs.map((proof) => (
              <article key={proof.skill} className={`rounded-xl border p-4 ${proof.verified ? 'border-emerald-200 bg-emerald-50/45 dark:border-emerald-900 dark:bg-emerald-950/20' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/70'}`}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{proof.skill}</h3>
                  {proof.verified ? <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[0.65rem] font-extrabold text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-300"><BadgeCheck className="h-3.5 w-3.5" />Evidence linked</span> : <span className="rounded-full bg-white px-2 py-1 text-[0.65rem] font-bold text-slate-500 dark:bg-slate-900 dark:text-slate-400">Needs proof</span>}
                </div>
                {proof.evidence.length ? (
                  <div className="mt-3 space-y-2">
                    {proof.evidence.slice(0, 2).map((project) => (
                      <Link key={project.id} to={`/projects/${project.id}`} className="product-focus flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:text-[#155eef] dark:bg-slate-900 dark:text-slate-200">
                        <span className="truncate">{project.title}</span><ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link to="/community-projects" className="product-focus mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#155eef] hover:underline">Add project evidence <ArrowRight className="h-3.5 w-3.5" /></Link>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
