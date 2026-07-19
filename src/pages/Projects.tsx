import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, FolderGit2, Heart, MessageSquare, ExternalLink, Github, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/StoreProvider';
import UserAvatar from '../components/UserAvatar';
import SubmitProjectModal from '../components/SubmitProjectModal';
import { projectService, type CommunityProject } from '../services/projectService';

export default function Projects() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState('All');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submittedProjects, setSubmittedProjects] = useState<CommunityProject[]>(() => projectService.getSubmittedProjects());
  const [notice, setNotice] = useState<string | null>(null);

  const projects = useMemo(() => [
    ...submittedProjects,
    ...projectService.getAllProjects(store.user).filter((project) => !submittedProjects.some((submitted) => submitted.id === project.id)),
  ], [store.user, submittedProjects]);

  const filteredProjects = projects.filter(p => {
    if (activeTab === 'Open to Collab') return p.openToCollab;
    if (activeTab === 'My Projects') return p.myProject;
    return true;
  });

  const handleSubmitted = (project: CommunityProject) => {
    setSubmittedProjects((current) => [project, ...current]);
    setShowSubmitModal(false);
    setActiveTab('My Projects');
    setNotice(`“${project.title}” is now visible in your projects.`);
  };

  return (
    <div className="max-w-5xl mx-auto w-full">
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

      <div className="flex items-center gap-2 mb-8 border-b border-gray-200 pb-px">
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
          key={activeTab}
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
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
                  <button className="p-2 bg-white text-gray-900 rounded-full hover:bg-blue-500 hover:text-white transition-colors">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-200 transition-colors">
                    <Github className="w-5 h-5" />
                  </button>
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
