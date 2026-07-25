import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_JOBS } from '../data';
import { MapPin, Clock, DollarSign, Building, TrendingUp, AlertCircle, ChevronLeft, UploadCloud, X, CheckCircle, Copy, Linkedin, Users, Globe, Bookmark, BookmarkCheck, ShieldCheck, ListChecks, Network } from 'lucide-react';
import JobCard from '../components/JobCard';
import { useStore } from '../store/StoreProvider';
import JobIntelligencePanel from '../components/JobIntelligencePanel';
import JobTrustSignals from '../components/JobTrustSignals';
import { getJobTrustProfile } from '../services/trustService';
import EmployerProfileLink from '../components/EmployerProfileLink';

export default function JobDetail() {
  const { id } = useParams();
  const job = MOCK_JOBS.find(j => j.id === id);
  const store = useStore();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [applyError, setApplyError] = useState('');

  const isSaved = job ? store.savedJobs.some(s => s.jobId === job.id) : false;
  const isApplied = job ? store.appliedJobs.some(a => a.jobId === job.id) : false;

  if (!job) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Job not found</h2>
        <p className="text-gray-500 mb-6">The job you are looking for does not exist or has been removed.</p>
        <Link to="/search" className="text-[#014BAA] hover:underline font-medium">
          &larr; Back to search
        </Link>
      </div>
    );
  }

  const trust = getJobTrustProfile(job);

  return (
    <div className="premium-page mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/jobs" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#014BAA] mb-6 transition-colors group">
        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" /> Back to jobs
      </Link>

      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="trust-surface mb-6 flex items-center gap-3 rounded-2xl border-blue-200 px-4 py-3 text-[#014BAA]"
          >
            <CheckCircle className="w-5 h-5 text-[#014BAA] shrink-0" />
            <p className="font-medium">Application sent! This employer has up to {trust.responseCommitmentDays} days to respond.</p>
            <Link to="/applications" className="ml-auto whitespace-nowrap text-sm font-semibold underline underline-offset-2 hover:text-[#013b86]">
              Track it
            </Link>
            <button onClick={() => setShowSuccessMessage(false)} aria-label="Dismiss application confirmation" className="text-[#014BAA] hover:text-[#014BAA]">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="trust-surface overflow-hidden rounded-[1.75rem]"
      >
        <div className="relative overflow-hidden border-b border-gray-100 p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-indigo-200/35 blur-3xl" />
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="relative flex items-start gap-5">
              <EmployerProfileLink job={job}><motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                whileHover={{ scale: 1.05, rotate: -3 }}
                className={`w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shrink-0 ${job.logoColor}`}
              >
                {job.logoInitials}
              </motion.div></EmployerProfileLink>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-lg text-gray-700">
                  <Building className="w-5 h-5 text-[#014BAA]" />
                  <span className="font-medium">{job.company}</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1.5 text-xs font-bold text-[#014BAA]">
                  <ShieldCheck className="h-4 w-4" /> Employer response promise enabled
                </div>
              </div>
            </div>
            <div className="relative flex min-w-[200px] flex-col gap-3">
              {!isApplied ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowApplyModal(true)}
                  className="w-full gradient-primary text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all text-center"
                >
                  Apply Now
                </motion.button>
              ) : (
                <motion.button
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  disabled
                  className="w-full bg-gradient-to-r from-blue-50 to-blue-50 text-[#014BAA] border border-blue-200 px-6 py-3 rounded-xl font-semibold shadow-sm transition-colors text-center flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" /> Applied ✓
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => isSaved ? store.unsaveJob(job.id) : store.saveJob(job.id)}
                className={`w-full px-6 py-3 rounded-xl font-medium transition-all text-center flex items-center justify-center gap-2 ${isSaved ? 'gradient-primary text-white shadow-md shadow-blue-500/25' : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50/50'}`}
              >
                {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                {isSaved ? 'Saved' : 'Save Job'}
              </motion.button>
            </div>
          </div>

          <div className="relative mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <MapPin className="w-5 h-5" />, label: 'Location', value: job.location, bg: 'from-blue-400 to-indigo-600' },
              { icon: <Clock className="w-5 h-5" />, label: 'Job Type', value: job.type, bg: 'from-blue-400 to-cyan-500' },
              { icon: <DollarSign className="w-5 h-5" />, label: 'Salary', value: job.salary, bg: 'from-blue-400 to-blue-500' },
              { icon: <TrendingUp className="w-5 h-5" />, label: 'Experience', value: job.experience, bg: 'from-lime-400 to-blue-500' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/75 p-3 text-gray-700 shadow-sm"
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.bg} flex items-center justify-center text-white shadow-sm`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{item.label}</p>
                  <p className="font-semibold">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50/70 to-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-8"><JobTrustSignals job={job} variant="full" /></div>
            <div className="mb-8">
              <JobIntelligencePanel job={job} user={store.user} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              About the Role
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-8">
              {job.description}
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                <ListChecks className="w-4 h-4 text-white" />
              </div>
              Requirements
            </h3>
            <ul className="space-y-3 mb-8">
              {job.requirements.map((req, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.04 }}
                  className="flex items-start"
                >
                  <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 mt-2 mr-3" />
                  <span className="text-gray-700">{req}</span>
                </motion.li>
              ))}
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-500 flex items-center justify-center">
                <Network className="w-4 h-4 text-white" />
              </div>
              Skills & Technologies
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {job.tags.map(tag => (
                <span key={tag} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-50 border border-blue-200/70 text-[#014BAA] text-sm font-medium rounded-lg shadow-sm">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">About {job.company}</h3>
              <div className="bg-white rounded-xl border border-gray-200/80 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm card-hover">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: -3 }}
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shrink-0 ${job.logoColor}`}
                >
                  {job.logoInitials}
                </motion.div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{job.company}</h4>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1.5"><Building className="w-4 h-4" /> Technology</span>
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> 1K-5K Employees</span>
                    <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> {job.company.toLowerCase().replace(/\s/g, '')}.com</span>
                  </div>
                  <button className="text-[#014BAA] hover:underline font-medium text-sm">
                    View Company Profile
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Share this job</h3>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-300 transition-all"
                >
                  <Copy className="w-4 h-4" /> Copy Link
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-lg text-sm font-medium hover:bg-[#0A66C2]/90 transition-colors"
                >
                  <Linkedin className="w-4 h-4" /> Share on LinkedIn
                </motion.button>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Similar Jobs</h3>
              <div className="flex flex-col gap-4">
                {MOCK_JOBS.filter(j => j.id !== job.id).slice(0, 3).map(similarJob => (
                  <JobCard key={similarJob.id} job={similarJob} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showApplyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                <h2 className="text-xl font-bold text-gray-900">Apply for {job.title}</h2>
                <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const result = store.applyToJob(job.id);
                  if (!result.success) {
                    setApplyError(result.error || 'Unable to submit your application.');
                    return;
                  }
                  setApplyError('');
                  setShowSuccessMessage(true);
                  setShowApplyModal(false);
                }}>
                  <div className="mb-6">
                    <JobIntelligencePanel job={job} user={store.user} variant="readiness" />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Resume / CV</label>
                    <div className="border-2 border-dashed border-blue-200 rounded-xl p-6 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/50 to-blue-50/30 hover:from-blue-50 hover:to-blue-50 cursor-pointer transition-all group">
                      <UploadCloud className="w-8 h-8 text-blue-400 group-hover:text-[#014BAA] transition-colors mb-2" />
                      <p className="text-sm text-gray-600 font-medium text-center">
                        <span className="text-[#014BAA] hover:underline">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PDF, DOCX up to 5MB</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn Profile URL</label>
                    <input 
                      type="url" 
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-[#F8F3F0] focus:bg-white" 
                      placeholder="https://linkedin.com/in/yourprofile"
                      required 
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Letter (Optional)</label>
                    <textarea 
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-[#F8F3F0] focus:bg-white resize-none" 
                      placeholder="Write a brief cover letter..." 
                      rows={4}
                    ></textarea>
                  </div>

                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Why do you want this role?</label>
                    <textarea 
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-[#F8F3F0] focus:bg-white resize-none" 
                      placeholder="What excites you about working at this company?" 
                      rows={4}
                      required
                    ></textarea>
                  </div>

                  <div className="flex gap-3 justify-end border-t border-gray-100 pt-6">
                    <button 
                      type="button" 
                      onClick={() => setShowApplyModal(false)}
                      className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-6 py-2.5 gradient-primary text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-blue-500/20"
                    >
                      Submit Application
                    </motion.button>
                  </div>
                  {applyError && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{applyError}</p>}
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
