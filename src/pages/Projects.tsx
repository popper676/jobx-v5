import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Eye, FolderGit2, Heart, MessageSquare, Search, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/StoreProvider';
import UserAvatar from '../components/UserAvatar';
import SubmitProjectModal from '../components/SubmitProjectModal';
import { PROJECT_CATEGORIES, projectService, type CommunityProject } from '../services/projectService';

export default function Projects() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState('All');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submittedProjects, setSubmittedProjects] = useState<CommunityProject[]>(() => projectService.getSubmittedProjects());
  const [notice, setNotice] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');

  const projects = useMemo(() => [
    ...submittedProjects,
    ...projectService.getAllProjects(store.user).filter((project) => !submittedProjects.some((submitted) => submitted.id === project.id)),
  ], [store.user, submittedProjects]);

  const filteredProjects = projects.filter(p => {
    if (activeTab === 'Open to Collab') return p.openToCollab;
    if (activeTab === 'My Projects') return p.myProject;
    return true;
  }).filter((project) => category === 'All categories' || project.category === category)
    .filter((project) => `${project.title} ${project.description} ${project.tags.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()));

  const handleSubmitted = (project: CommunityProject) => {
    setSubmittedProjects((current) => [project, ...current]);
    setShowSubmitModal(false);
    setActiveTab('My Projects');
    setNotice(`“${project.title}” is now visible in your projects.`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="flex justify-between items-end mb-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-900 tracking-tight"
          >
            Community Projects
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-500 mt-2 text-sm sm:text-base"
          >
            Discover what professionals are building, share your own work, and collaborate.
          </motion.p>
        </div>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowSubmitModal(true)}
          className="hidden sm:block gradient-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/25"
        >
          <span className="inline-flex items-center gap-2.5"><span aria-hidden="true" className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-white/15"><FolderGit2 className="h-4 w-4" /></span>Submit Project</span>
        </motion.button>
      </div>

      {notice && <div role="status" className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />{notice}</span><button type="button" onClick={() => setNotice(null)} aria-label="Dismiss project confirmation" className="rounded p-0.5 text-emerald-700 hover:bg-emerald-100"><X className="h-4 w-4" /></button></div>}

      <section className="mb-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_15rem]">
        <label className="relative"><span className="sr-only">Search projects</span><Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, skills, or creators" className="product-focus min-h-12 w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-semibold text-slate-900 shadow-sm outline-none placeholder:text-slate-400" /></label>
        <label><span className="sr-only">Project category</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="product-focus min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm outline-none"><option>All categories</option>{PROJECT_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
      </section>

      <div className="mb-8 flex items-center gap-2 border-b border-gray-200 pb-px">
        {['All', 'Open to Collab', 'My Projects'].map((tab, index) => (
          <motion.button
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-blue-500 text-[#014BAA]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${category}-${query}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="card-hover bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col relative"
            >
              <Link to={`/projects/${project.id}`} className="absolute inset-0 z-10" aria-label={`View ${project.title}`}></Link>
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
                  {project.openToCollab && (
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Users className="w-3 h-3" /> Collab
                    </span>
                  )}
                  <span className="w-fit rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-700 shadow-sm">{project.category || 'Web Apps'}</span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow relative z-20 pointer-events-none">
                <div className="flex gap-2 mb-3 pointer-events-auto">
                  {project.tags.map(tag => (
                    <span key={tag} className="bg-gradient-to-r from-blue-50 to-blue-50 text-[#014BAA] border border-blue-200/50 px-2 py-0.5 rounded text-xs font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-[#014BAA] transition-colors cursor-pointer pointer-events-auto">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-grow">
                  {project.description}
                </p>

                <div className="pt-4 border-t border-gray-100 mt-auto flex items-center justify-between pointer-events-auto">
                  <div className="flex items-center gap-2">
                    <UserAvatar src={project.author.avatar} name={project.author.name} size="xs" />
                    <span className="text-xs font-medium text-gray-700">{project.author.name}</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-500 text-xs">
                    <span className="flex items-center gap-1" title="Visitors"><Eye className="h-4 w-4" />{project.metrics.visitors || 0}</span>
                    <span className="flex items-center gap-1" title="Collaborators"><Users className="h-4 w-4" />{project.metrics.collaborators || 0}</span>
                    <button className="flex items-center gap-1 hover:text-[#014BAA] transition-colors">
                      <Heart className="w-4 h-4" />
                      <span>{project.metrics.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-gray-900 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span>{project.metrics.comments}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredProjects.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><Search className="mx-auto h-8 w-8 text-slate-300" /><h2 className="mt-3 text-lg font-extrabold text-slate-900">No projects match</h2><p className="mt-1 text-sm text-slate-500">Try another category or search term.</p></div>}
        </motion.div>
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowSubmitModal(true)}
        className="sm:hidden w-full mt-6 gradient-primary text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/25"
      >
        <span className="inline-flex items-center justify-center gap-2.5"><span aria-hidden="true" className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-white/15"><FolderGit2 className="h-4 w-4" /></span>Submit Project</span>
      </motion.button>

      {showSubmitModal && <SubmitProjectModal user={store.user} onClose={() => setShowSubmitModal(false)} onSubmitted={handleSubmitted} />}
    </div>
  );
}
