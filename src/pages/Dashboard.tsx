import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_JOBS } from '../data';
import { useStore } from '../store/StoreProvider';
import JobCard from '../components/JobCard';
import UserAvatar from '../components/UserAvatar';
import CareerPassportCard from '../components/CareerPassportCard';
import { Bookmark, Compass, Star, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCareerRecommendations } from '../services/careerIntelligenceService';

export default function Dashboard() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState<'recommended' | 'saved' | 'applied'>('recommended');

  const recommendedJobs = getCareerRecommendations(store.user).slice(0, 4).map((recommendation) => recommendation.job);
  const savedJobs = MOCK_JOBS.filter(job => store.savedJobs.some(sj => sj.jobId === job.id));
  const appliedJobs = MOCK_JOBS.filter(job => store.appliedJobs.some(aj => aj.jobId === job.id));

  const tabJobs = activeTab === 'recommended' ? recommendedJobs : activeTab === 'saved' ? savedJobs : appliedJobs;

  const profileCompletion = store.user.skills.length > 0
    ? Math.min(100, Math.round((store.user.skills.length / 5) * 60 + (store.user.bio ? 20 : 0) + (store.user.experience.length > 0 ? 20 : 0)))
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full grid grid-cols-1 md:grid-cols-12 gap-8">
      <motion.div
        className="md:col-span-3 space-y-5"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-24 card-hover">
          <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <div className="px-6 pb-6 relative">
            <div className="w-16 h-16 bg-white rounded-full p-1 absolute -top-8 left-6 shadow-sm">
              <UserAvatar src={store.user.avatar} name={store.user.name} size="lg" className="w-full h-full" />
            </div>
            <div className="pt-10">
              <h2 className="text-xl font-bold text-gray-900">{store.user.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{store.user.title}</p>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Profile completion</span>
                  <span className="font-semibold text-[#014BAA]">{profileCompletion}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full" style={{ width: `${profileCompletion}%` }}></div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Connections</span>
                  <span className="font-semibold text-gray-900">{store.user.connections}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Profile views</span>
                  <span className="font-semibold text-gray-900">{store.user.profileViews}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                <Link to="/resume" className="w-full flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-[#014BAA] transition-colors gradient-primary rounded-lg px-4 py-2">
                  <FileText className="w-5 h-4 text-white" />
                  <span className="text-white">My Resume</span>
                </Link>
                <Link to="/career-coach" className="w-full flex items-center gap-3 text-sm font-medium text-[#014BAA] hover:text-[#013b86] transition-colors rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-2">
                  <Compass className="w-5 h-4" />
                  <span>Career Coach</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <CareerPassportCard user={store.user} jobs={MOCK_JOBS} compact />
      </motion.div>

      <div className="md:col-span-9">
        <motion.h1
          className="text-2xl font-bold text-gray-900 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          My Dashboard
        </motion.h1>

        <div className="flex overflow-x-auto no-scrollbar border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('recommended')}
            className={`flex items-center gap-2 py-4 px-6 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'recommended'
                ? 'border-blue-500 text-[#014BAA]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Star className={`w-4 h-4 ${activeTab === 'recommended' ? 'text-[#014BAA]' : 'text-gray-400'}`} />
            Recommended for you
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 py-4 px-6 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'saved'
                ? 'border-blue-500 text-[#014BAA]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${activeTab === 'saved' ? 'text-[#014BAA]' : 'text-gray-400'}`} />
            Saved Jobs ({savedJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('applied')}
            className={`flex items-center gap-2 py-4 px-6 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'applied'
                ? 'border-blue-500 text-[#014BAA]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === 'applied' ? 'text-[#014BAA]' : 'text-gray-400'}`} />
            Applied ({appliedJobs.length})
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {tabJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}

            {activeTab === 'saved' && savedJobs.length === 0 && (
              <div className="py-12 text-center bg-white rounded-xl border border-gray-200 border-dashed">
                <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No saved jobs yet</p>
              </div>
            )}

            {activeTab === 'applied' && appliedJobs.length === 0 && (
              <div className="py-12 text-center bg-white rounded-xl border border-gray-200 border-dashed">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No applied jobs yet</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
