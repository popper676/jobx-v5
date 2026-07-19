import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, MessageSquare, Share2, Bookmark, Github, ExternalLink, 
  Users, UserPlus, ChevronLeft, Send, X, Terminal, Monitor, PenTool, CheckCircle
} from 'lucide-react';
import { useStore } from '../store/StoreProvider';
import UserAvatar from '../components/UserAvatar';
import { projectService } from '../services/projectService';

type ProjectDetailRecord = {
  title: string;
  description: string;
  image: string;
  tags: readonly string[];
  openToCollab: boolean;
  author: { name: string; title: string; avatar: string; isFollowing: boolean };
  repositoryUrl?: string;
  demoUrl?: string;
};

const PROJECT_DETAILS = {
  '1': {
    title: 'Jobx Social Platform',
    description: 'A career opportunity workspace built with React, Tailwind CSS, and Vite. It brings together skills evidence, transparent jobs, accountable applications, and project showcases for modern job seekers.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&h=400&q=80',
    tags: ['React', 'TypeScript', 'Tailwind CSS'],
    openToCollab: true,
    author: { name: 'You', title: 'Full Stack Developer', avatar: '', isFollowing: false },
  },
  '2': {
    title: 'DevChat Workspace',
    description: 'Real-time collaborative workspace for developers with code highlighting, video calls, and integrated terminal. Designed to replace Slack for small dev teams. Built with performance and developer experience in mind, allowing you to pair program instantly without leaving the chat interface.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&h=400&q=80',
    tags: ['Next.js', 'Socket.io', 'WebRTC', 'Tailwind CSS', 'Redis'],
    openToCollab: true,
    author: { name: 'Sarah Chen', title: 'Senior Full Stack Engineer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', isFollowing: false },
  },
  '3': {
    title: 'FinTech Dashboard',
    description: 'An open-source financial dashboard template with analytics, user tracking, and revenue forecasting. It focuses on clear data storytelling and reusable chart patterns for product teams.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=400&q=80',
    tags: ['Vue', 'D3.js', 'Firebase'],
    openToCollab: false,
    author: { name: 'Marcus Rodriguez', title: 'Product Designer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', isFollowing: false },
  },
} as const;

export default function ProjectDetail() {
  const { id } = useParams();
  const store = useStore();
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'accepted'>('none');
  const [selectedRole, setSelectedRole] = useState('');

  const submittedProject = id ? projectService.getProjectById(id, store.user) : undefined;
  const selectedProject: ProjectDetailRecord | undefined = submittedProject
    ? {
      title: submittedProject.title,
      description: submittedProject.description,
      image: submittedProject.image,
      tags: submittedProject.tags,
      openToCollab: submittedProject.openToCollab,
      author: {
        name: submittedProject.author.name,
        title: submittedProject.author.title || store.user.title || 'JobX member',
        avatar: submittedProject.author.avatar,
        isFollowing: false,
      },
      repositoryUrl: submittedProject.repositoryUrl,
      demoUrl: submittedProject.demoUrl,
    }
    : PROJECT_DETAILS[id as keyof typeof PROJECT_DETAILS] as ProjectDetailRecord | undefined;

  if (!selectedProject) {
    return <div className="max-w-5xl mx-auto w-full py-16 text-center"><h1 className="text-2xl font-extrabold text-gray-900">Project not found</h1><p className="mt-2 text-sm text-gray-500">This project may have been removed or is not available in this browser.</p><Link to="/projects" className="mt-5 inline-flex text-sm font-bold text-[#014BAA] hover:underline">Back to Projects</Link></div>;
  }

  const project = {
    ...selectedProject,
    author: selectedProject.author.name === 'You'
      ? { ...selectedProject.author, name: store.user.name, title: store.user.title || selectedProject.author.title, avatar: store.user.avatar }
      : selectedProject.author,
    collaborators: [
      { name: 'Sarah Chen', role: 'Lead Developer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { name: 'Marcus R.', role: 'UI/UX Designer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    ],
    openRoles: [
      { role: 'Backend Dev (Node.js/Redis)', icon: <Terminal className="w-5 h-5 text-[#014BAA]" />, filled: false },
      { role: 'Frontend Designer (React)', icon: <Monitor className="w-5 h-5 text-blue-500" />, filled: false },
      { role: 'Technical Writer', icon: <PenTool className="w-5 h-5 text-orange-600" />, filled: false }
    ],
    comments: [
      { id: 1, user: store.user.name, avatar: store.user.avatar, text: 'This looks incredible! Love the WebRTC integration.', time: '2h ago' }
    ]
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestStatus('pending');
    setShowCollabModal(false);
  };

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const AVAILABLE_SKILLS = [
    'React', 'Node.js', 'UI/UX Design', 'TypeScript', 'Python', 'DevOps', 'Next.js', 'Figma'
  ];

  return (
    <div className="max-w-5xl mx-auto w-full pb-12">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Projects
        </Link>
      </motion.div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <motion.div
          className="h-48 md:h-80 w-full overflow-hidden relative"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
          {project.openToCollab && (
            <motion.div
              className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Users className="w-4 h-4" /> OPEN TO COLLAB
            </motion.div>
          )}
        </motion.div>

        <div className="p-6 md:p-10 divide-y divide-gray-100">
          <div className="pb-8 flex flex-col md:flex-row gap-8 justify-between">
            <div className="flex-1">
              <motion.div
                className="flex gap-2 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {project.tags.map((tag, index) => (
                  <motion.span
                    key={tag}
                    className="bg-gradient-to-r from-blue-50 to-blue-50 text-[#014BAA] border border-blue-200/50 px-2.5 py-1 rounded text-xs font-semibold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </motion.div>

              <motion.h1
                className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {project.title}
              </motion.h1>

              <motion.p
                className="text-gray-600 mt-4 text-base md:text-lg leading-relaxed max-w-3xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {project.description}
              </motion.p>

              <motion.div
                className="flex flex-wrap items-center gap-4 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {project.repositoryUrl && <motion.a href={project.repositoryUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><Github className="w-4 h-4" /> Repository</motion.a>}
                {project.demoUrl && <motion.a href={project.demoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-[#F8F3F0] text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><ExternalLink className="w-4 h-4" /> Live Demo</motion.a>}
              </motion.div>
            </div>

            <motion.div
              className="md:w-72 shrink-0 bg-[#F8F3F0] rounded-xl p-5 border border-gray-100 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2 w-full">Project Author</span>
              <UserAvatar src={project.author.avatar} name={project.author.name} size="xl" className="border-4 border-white shadow-sm mb-3" />
              <h3 className="font-bold text-gray-900">{project.author.name}</h3>
              <p className="text-xs text-gray-500 mb-4">{project.author.title}</p>
              <div className="w-full space-y-2">
                <button className="w-full bg-white border border-primary text-primary hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Follow
                </button>
                {requestStatus === 'none' ? (
                  <motion.button 
                    onClick={() => setShowCollabModal(true)}
                    className="w-full gradient-primary text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <UserPlus className="w-4 h-4" /> Request to Collab
                  </motion.button>
                ) : (
                  <button disabled className="w-full bg-blue-50 text-[#014BAA] border border-blue-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                    <CheckCircle className="w-4 h-4" /> Request Sent ✓
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          <div className="py-4 flex flex-wrap gap-2 justify-between items-center">
            <div className="flex gap-2 w-full sm:w-auto">
              <motion.button
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#F8F3F0] hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Heart className="w-4 h-4" /> Like (89)
              </motion.button>
              <motion.button
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#F8F3F0] hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageSquare className="w-4 h-4" /> Comment
              </motion.button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <motion.button
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:bg-[#F8F3F0] rounded-lg text-sm font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Share2 className="w-4 h-4" /> Share
              </motion.button>
              <motion.button
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:bg-[#F8F3F0] rounded-lg text-sm font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Bookmark className="w-4 h-4" /> Save
              </motion.button>
            </div>
          </div>

          <div className="py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" /> Current Team
              </h2>
              <div className="space-y-4">
                {project.collaborators.map((c, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-4 bg-[#F8F3F0] border border-gray-100 p-4 rounded-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-gray-900">{c.name}</h4>
                      <p className="text-sm text-gray-600">{c.role}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-gray-400" /> Open Roles
              </h2>
              <div className="space-y-4">
                {project.openRoles.map((role, i) => (
                  <motion.div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-dashed border-gray-300 p-4 rounded-xl hover:border-primary/50 transition-colors group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="p-2 bg-[#F8F3F0] rounded-lg shrink-0">
                        {role.icon}
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{role.role}</h4>
                    </div>
                    {requestStatus === 'none' ? (
                      <motion.button 
                        onClick={() => {
                          setSelectedRole(role.role);
                          setShowCollabModal(true);
                        }}
                        className="text-primary hover:text-white bg-blue-50 hover:bg-primary px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap self-start sm:self-auto relative z-20"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Apply
                      </motion.button>
                    ) : (
                       <button disabled className="text-[#014BAA] bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap self-start sm:self-auto relative z-20 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Sent ✓
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-10">
             <h2 className="text-xl font-bold text-gray-900 mb-6">Discussion</h2>
             <div className="flex gap-4 mb-8">
                <UserAvatar src={store.user.avatar} name={store.user.name} size="md" />
               <div className="flex-1">
                 <textarea 
                   className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-sm bg-[#F8F3F0] focus:bg-white" 
                   placeholder="Add to the discussion..." 
                   rows={3}
                 ></textarea>
                 <div className="flex justify-end mt-2">
                   <motion.button
                     className="gradient-primary text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                   >
                     Post Comment
                   </motion.button>
                 </div>
               </div>
             </div>

             <div className="space-y-6">
               {project.comments.map(comment => (
                 <div key={comment.id} className="flex gap-4">
                   <UserAvatar src={comment.avatar} name={comment.user} size="md" className="shrink-0" />
                   <div>
                     <div className="flex items-baseline gap-2 mb-1">
                       <h4 className="font-semibold text-gray-900 text-sm">{comment.user}</h4>
                       <span className="text-xs text-gray-500">{comment.time}</span>
                     </div>
                     <p className="text-gray-700 text-sm">{comment.text}</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCollabModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Request to Collaborate</h2>
                <motion.button 
                  onClick={() => setShowCollabModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              
              <form onSubmit={handleSendRequest} className="p-6 overflow-y-auto max-h-[80vh]">
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Role</label>
                  <select 
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-[#F8F3F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    required
                  >
                    <option value="" disabled>-- Select a role --</option>
                    <option value="General Collaborator">General Collaborator</option>
                    {project.openRoles.map(r => (
                      <option key={r.role} value={r.role}>{r.role}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SKILLS.map(skill => (
                      <motion.button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          selectedSkills.includes(skill)
                            ? 'bg-blue-50 border-primary text-primary'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-[#F8F3F0]'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {skill}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Availability</label>
                  <select className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-[#F8F3F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required>
                    <option value="" disabled selected>-- Select availability --</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="weekends">Weekends Only</option>
                    <option value="evenings">Evenings</option>
                  </select>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Portfolio / GitHub Link</label>
                  <input 
                    type="url"
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-[#F8F3F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="https://github.com/yourusername"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Short Intro Message</label>
                  <textarea 
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm bg-[#F8F3F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    placeholder="Introduce yourself and explain why you'd be a great fit for this project..."
                    rows={3}
                    required
                  ></textarea>
                </div>

                <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 mt-2">
                  <motion.button 
                    type="button" 
                    onClick={() => setShowCollabModal(false)}
                    className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    type="submit"
                    className="px-6 py-2 gradient-primary text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send className="w-4 h-4" /> Send Request
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
