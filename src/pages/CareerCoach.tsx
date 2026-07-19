import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Circle, FileText, TrendingUp } from 'lucide-react';
import { MOCK_JOBS } from '../data';
import CareerPassportCard from '../components/CareerPassportCard';
import { getCareerCoachPlan, getCompletedCoachActions, setCoachActionCompleted } from '../services/careerCoachService';
import { useStore } from '../store/StoreProvider';

export default function CareerCoach() {
  const store = useStore();
  const [completedIds, setCompletedIds] = useState<string[]>(getCompletedCoachActions);
  const plan = useMemo(() => getCareerCoachPlan(store.user, MOCK_JOBS, completedIds), [store.user, completedIds]);
  const completedCount = plan.actions.filter((action) => action.completed).length;
  const progress = Math.round((completedCount / plan.actions.length) * 100);
  const nextAction = plan.actions.find((action) => !action.completed) ?? null;

  const toggleAction = (actionId: string, completed: boolean) => {
    setCompletedIds(setCoachActionCompleted(actionId, !completed));
  };

  return (
    <div className="product-page -mx-4 min-h-[calc(100vh-4rem)] px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="product-shell py-6 sm:py-8">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-7 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Career planning</p>
            <h1 className="product-title mt-1.5 text-3xl sm:text-4xl">Career Coach</h1>
            <p className="product-copy mt-2 max-w-2xl text-sm sm:text-base">A clear, practical plan for strengthening your profile and preparing for your next role.</p>
          </div>
          <Link to="/resume" className="product-button-secondary product-focus self-start px-4 sm:self-auto">
            <FileText className="h-4 w-4" /> Resume builder
          </Link>
        </header>

        <section className="product-surface mt-6 p-5 sm:p-6" aria-labelledby="career-goal-title">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Career goal</p>
              <h2 id="career-goal-title" className="mt-1 text-xl font-bold tracking-[-0.025em] text-slate-900 dark:text-white">{plan.targetRole}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Follow the steps below to make your experience clearer and more relevant to this direction.</p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-slate-600 dark:text-slate-300"><span className="text-2xl font-bold tracking-[-0.04em] text-slate-900 dark:text-white">{completedCount}</span> of {plan.actions.length} completed</p>
          </div>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-[#014BAA] transition-[width] duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{progress}% of your current plan is complete</p>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)] xl:items-start">
          <section className="product-surface overflow-hidden" aria-labelledby="plan-title">
            <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
              <h2 id="plan-title" className="text-lg font-bold tracking-[-0.025em] text-slate-900 dark:text-white">Your plan</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose one focused action at a time. Your progress is saved on this device.</p>
            </div>
            <ol className="divide-y divide-slate-100 dark:divide-slate-800">
              {plan.actions.map((action, index) => (
                <li key={action.id} className="px-5 py-5 sm:px-6">
                  <div className="flex items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => toggleAction(action.id, action.completed)}
                      aria-label={`${action.completed ? 'Mark incomplete' : 'Mark complete'}: ${action.title}`}
                      aria-pressed={action.completed}
                      className={`product-focus mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${action.completed ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white text-slate-400 hover:border-[#155eef] hover:text-[#155eef] dark:border-slate-600 dark:bg-slate-900'}`}
                    >
                      {action.completed ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Step {index + 1} · {action.phase}</p>
                      <h3 className={`mt-1 text-base font-bold ${action.completed ? 'text-slate-500 line-through dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>{action.title}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">{action.detail}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <Link to={action.href} className="product-focus inline-flex items-center gap-1.5 text-sm font-semibold text-[#155eef] hover:text-[#0c3e9e]">
                          {action.ctaLabel}<ArrowRight className="h-4 w-4" />
                        </Link>
                        <button type="button" onClick={() => toggleAction(action.id, action.completed)} className="product-focus text-sm font-medium text-slate-500 hover:text-[#155eef] dark:text-slate-400">
                          {action.completed ? 'Mark incomplete' : 'Mark complete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <aside className="space-y-5 xl:sticky xl:top-20">
            <CareerPassportCard user={store.user} jobs={MOCK_JOBS} />
            {nextAction && (
              <section className="product-surface p-5" aria-labelledby="next-step-title">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Next step</p>
                <h2 id="next-step-title" className="mt-1 text-lg font-bold tracking-[-0.025em] text-slate-900 dark:text-white">{nextAction.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{nextAction.detail}</p>
                <Link to={nextAction.href} className="product-button-primary product-focus mt-4 w-full">
                  {nextAction.ctaLabel}<ArrowRight className="h-4 w-4" />
                </Link>
              </section>
            )}
            {plan.recommendedRole && (
              <section className="product-surface p-5" aria-labelledby="role-to-explore-title">
                <div className="flex items-start gap-3">
                  <BriefcaseBusiness aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Role to explore</p>
                    <h2 id="role-to-explore-title" className="mt-1 text-base font-bold text-slate-900 dark:text-white">{plan.recommendedRole.job.title}</h2>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{plan.recommendedRole.job.company}</p>
                  </div>
                </div>
                <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200"><TrendingUp className="h-4 w-4 text-[#155eef]" />{plan.recommendedRole.intelligence.score}% fit</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{plan.recommendedRole.reason}</p>
                <Link to={`/jobs/${plan.recommendedRole.job.id}`} className="product-focus mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#155eef] hover:text-[#0c3e9e]">
                  View job details <ArrowRight className="h-4 w-4" />
                </Link>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
