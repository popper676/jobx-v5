import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Briefcase, LayoutDashboard, FolderGit2, Settings, Bell, MessageSquare, LogOut, User, X, FileText, RefreshCw, Bot, UsersRound } from 'lucide-react';
import { useStore } from '../store/StoreProvider';
import { useRole } from '../context/RoleContext';
import { MOCK_JOBS } from '../data';
import ProfileSetupOverlay from './ProfileSetupOverlay';
import UserAvatar from './UserAvatar';
import EmployerNav from './EmployerNav';
import RoleTransitionScreen from './RoleTransitionScreen';
import { SpotlightNavbar } from './ui/SpotlightNavbar';
import { NotificationList } from './ui/NotificationList';
import BrandLogo from './BrandLogo';

export default function Layout() {
  const navigate = useNavigate();
  const store = useStore();
  const { role, toggleRole, isTransitioning } = useRole();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const isEmployer = role === 'employer';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firstName = store.user.name.split(' ')[0];
  const unreadCount = store.notifications.filter((notification) => !notification.read && notification.type !== 'connection').length;

  const handleSignOut = () => {
    setShowUserMenu(false);
    store.logout();
    navigate('/signin');
  };

  const handleRoleSwitch = () => {
    setShowUserMenu(false);
    toggleRole();
    setTimeout(() => {
      navigate(isEmployer ? '/dashboard' : '/employer');
    }, 600);
  };

  const searchResults = (() => {
    if (!searchQuery.trim()) return { jobs: [] };
    const q = searchQuery.toLowerCase();
    return {
      jobs: MOCK_JOBS.filter(j => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.tags.some(t => t.toLowerCase().includes(q))).slice(0, 4),
    };
  })();

  const hasResults = searchResults.jobs.length > 0;

  const seekerNavLinks = [
    { name: 'About me', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'My Network', path: '/network', icon: <UsersRound className="w-5 h-5" /> },
    { name: 'Jobs', path: '/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Tracker', path: '/applications', icon: <FileText className="w-5 h-5" /> },
    { name: 'Projects', path: '/projects', icon: <FolderGit2 className="w-5 h-5" /> },
    { name: 'AI Assistant', path: '/career-coach', icon: <Bot className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F8F3F0]">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to={isEmployer ? '/employer' : '/dashboard'} className="flex items-center gap-2 group">
                <BrandLogo className="h-9 w-9 transition-transform group-hover:-translate-y-0.5" />
              </Link>
              
              <div className="hidden md:block relative" ref={searchRef}>
                <div className="flex items-center bg-[#F8F3F0] rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder={isEmployer ? "Search jobs, applicants..." : "Search jobs..."}
                    className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-56 outline-none"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearch(true);
                    }}
                    onFocus={() => setShowSearch(true)}
                  />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(''); setShowSearch(false); }} className="text-gray-400 hover:text-gray-600 ml-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {showSearch && searchQuery.trim() && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full mt-2 w-80 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200/80 overflow-hidden z-50"
                    >
                      {hasResults ? (
                        <div className="max-h-96 overflow-y-auto">
                          {searchResults.jobs.length > 0 && (
                            <div>
                              <div className="px-4 py-2 bg-gradient-to-r from-blue-50/50 to-blue-50/30 border-b border-gray-100">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Jobs</span>
                              </div>
                              {searchResults.jobs.map(job => (
                                <Link
                                  key={job.id}
                                  to={`/jobs/${job.id}`}
                                  onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/50 transition-colors"
                                >
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${job.logoColor}`}>
                                    {job.logoInitials}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                                    <p className="text-xs text-gray-500">{job.company}</p>
                                  </div>
                                  <Briefcase className="w-3.5 h-3.5 text-[#014BAA]" />
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No results for "{searchQuery}"</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Conditional nav */}
            {isEmployer ? (
              <EmployerNav />
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center">
                <SpotlightNavbar 
                  items={seekerNavLinks.map(link => ({ label: link.name, href: link.path }))} 
                />
              </div>
            )}

            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/messages" className="p-2 text-gray-500 hover:text-[#014BAA] hover:bg-blue-50 rounded-full transition-colors relative">
                <MessageSquare className="w-5 h-5" />
              </Link>
              
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-blue-50 text-[#014BAA]' : 'text-gray-500 hover:text-[#014BAA] hover:bg-blue-50'}`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <NotificationList onClose={() => setShowNotifications(false)} />
                  )}
                </AnimatePresence>
              </div>

              <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block"></div>
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:bg-blue-50/50 p-1 pr-2 rounded-full transition-colors border border-transparent hover:border-blue-200/50"
                >
                  <UserAvatar src={store.user.avatar} name={store.user.name} size="sm" className="border-2 border-blue-200/50" />
                  <span className="text-sm font-medium hidden sm:block">{firstName}</span>
                  {isEmployer && (
                    <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Employer
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200/80 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-blue-50/30">
                        <p className="font-semibold text-gray-900 text-sm">{store.user.name}</p>
                        <p className="text-xs text-gray-500">{store.user.email}</p>
                        <span className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${isEmployer ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-50 text-[#014BAA] border-blue-200'}`}>
                          {isEmployer ? 'Employer' : 'Job Seeker'}
                        </span>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/50 transition-colors text-sm text-gray-700"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        Profile
                      </Link>
                      <button
                        onClick={handleRoleSwitch}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/50 transition-colors text-sm text-gray-700 w-full"
                      >
                        <RefreshCw className="w-4 h-4 text-gray-400" />
                        Switch to {isEmployer ? 'Job Seeker' : 'Employer'}
                      </button>
                      <div className="border-t border-gray-100">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50/50 transition-colors text-sm text-red-600 w-full"
                        >
                          <LogOut className="w-4 h-4 text-red-400" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col pt-6 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <RoleTransitionScreen />

      {!store.user.profileCompleted && <ProfileSetupOverlay />}
    </div>
  );
}
