import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Eye, EyeOff, CheckCircle, Mail, User, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../store/StoreProvider';
import UserAvatar from '../components/UserAvatar';
import JobXCareerSignal from '../components/JobXCareerSignal';

export default function SignUp() {
  const navigate = useNavigate();
  const store = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<{ name: string; email: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = store.signup(name.trim(), email.trim(), password);
      if (result.success) {
        setCreatedAccount({ name: name.trim(), email: email.trim().toLowerCase() });
      } else {
        setError(result.error || 'Sign up failed.');
      }
      setLoading(false);
    }, 500);
  };

  if (createdAccount) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="w-16 h-16 rounded-full gradient-primary mx-auto flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4"
            >
              <JobXCareerSignal className="w-9 h-9 text-white" />
            </motion.div>
            <h2 className="text-2xl font-extrabold text-gray-900">Account Created!</h2>
            <p className="text-sm text-gray-500 mt-1">Your Jobx journey starts now</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="h-24 gradient-header relative" />
            <div className="px-6 pb-6">
              <div className="flex justify-center -mt-12 mb-4">
                <UserAvatar src={store.user.avatar} name={createdAccount.name} size="xl" className="w-24 h-24 border-4 border-white shadow-lg" />
              </div>
              <div className="text-center space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{createdAccount.name}</h3>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-sm text-gray-500">{createdAccount.email}</p>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#014BAA]" />
                    <span className="text-sm font-medium text-[#014BAA]">Account verified & ready</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <User className="w-3.5 h-3.5" />
                  <span>Full Stack Developer</span>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">0</p>
                    <p className="text-[10px] text-gray-500 uppercase font-medium">Connections</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">0</p>
                    <p className="text-[10px] text-gray-500 uppercase font-medium">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">0</p>
                    <p className="text-[10px] text-gray-500 uppercase font-medium">Endorsements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="w-full mt-6 flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md shadow-blue-500/25 text-sm font-medium text-white gradient-primary transition-colors"
          >
            Start Exploring <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-blue-500/25"
          >
            <Briefcase className="w-8 h-8 text-white" />
          </motion.div>
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-center text-3xl font-extrabold text-gray-900"
        >
          Create your account
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-2 text-center text-sm text-gray-600"
        >
          Already have an account?{' '}
          <Link to="/signin" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3"
            >
              {error}
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500/20 focus:border-blue-400 sm:text-sm"
                  placeholder="Your full name"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500/20 focus:border-blue-400 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="appearance-none block w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500/20 focus:border-blue-400 sm:text-sm"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 }}
            >
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500/20 focus:border-blue-400 sm:text-sm"
                  placeholder="Re-enter your password"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md shadow-blue-500/25 text-sm font-medium text-white gradient-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-60"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </motion.button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
