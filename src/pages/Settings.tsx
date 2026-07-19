import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreProvider';
import DarkModeToggle from '../components/employer/DarkModeToggle';
import Breadcrumb from '../components/employer/Breadcrumb';
import UserAvatar from '../components/UserAvatar';
import { 
  User, Bell, Lock, Eye, CreditCard, ChevronRight, Moon, Sun, Monitor, Shield, 
  Trash2, Plus, Download, LogOut, CheckCircle, X, Camera, Save, Palette, RotateCcw,
  Crown, Star
} from 'lucide-react';

export default function Settings() {
  const store = useStore();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('Account Settings');
  
  const [personalInfo, setPersonalInfo] = useState({ 
    name: store.user.name || '', 
    bio: store.user.bio || '', 
    location: store.user.location || '', 
    website: store.user.website || '' 
  });
  const [emails, setEmails] = useState([store.user.email || 'alex@example.com']);
  const [newEmail, setNewEmail] = useState('');
  
  const [twoFactor, setTwoFactor] = useState(true);
  const [profileVis, setProfileVis] = useState('everyone');
  const [msgPerms, setMsgPerms] = useState('everyone');
  const [showOnline, setShowOnline] = useState(true);
  
  const [notifs, setNotifs] = useState({ jobs: true, collab: true, comments: false, dms: true, preferEmail: true });

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [savedDataStatus, setSavedDataStatus] = useState<string | null>(null);

  useEffect(() => {
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const triggerSave = (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    store.updateUser({
      name: personalInfo.name,
      email: emails[0],
      bio: personalInfo.bio,
      location: personalInfo.location,
      website: personalInfo.website
    });
    setSavedDataStatus('Changes saved successfully.');
    setTimeout(() => setSavedDataStatus(null), 3000);
  };

  const handleSignOut = () => {
    store.logout();
    navigate('/signin');
  };

  const handleResetAll = () => {
    store.resetAll();
    setPersonalInfo({ name: '', bio: '', location: '', website: '' });
    setEmails(['alex@example.com']);
    setSavedDataStatus('All data has been reset.');
    setTimeout(() => setSavedDataStatus(null), 3000);
  };

  const sections = [
    { title: 'Account Settings', icon: <User className="w-5 h-5" /> },
    { title: 'Security & Access', icon: <Lock className="w-5 h-5" /> },
    { title: 'Privacy', icon: <Eye className="w-5 h-5" /> },
    { title: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { title: 'Billing & Payments', icon: <CreditCard className="w-5 h-5" /> },
    { title: 'Appearance', icon: <Palette className="w-5 h-5" /> }
  ];

  const SectionHeader = ({ title, desc }: { title: string, desc: string }) => (
    <motion.div className="mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-1">{desc}</p>
    </motion.div>
  );

  const Card = ({ children, title, index = 0 }: { children: React.ReactNode, title?: string, index?: number }) => (
    <motion.div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {title && <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>}
      {children}
    </motion.div>
  );

  const renderContent = () => {
    switch(activeSection) {
      case 'Account Settings':
        return (
          <>
            <SectionHeader title="Account Settings" desc="Manage your personal details and account data." />
            
            <Card title="Personal Information" index={0}>
              <form onSubmit={triggerSave}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <UserAvatar src={store.user.avatar} name={store.user.name} size="xl" className="border border-gray-200" />
                    <label className="absolute bottom-0 right-0 p-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-primary transition-colors cursor-pointer">
                      <Camera className="w-4 h-4" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onloadend = () => store.updateUser({ avatar: reader.result as string });
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Profile Photo</h4>
                    <p className="text-xs text-gray-500 mt-1">Recommended 256x256px. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                    <input type="text" value={personalInfo.name} onChange={e => setPersonalInfo({...personalInfo, name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-[#F8F3F0] focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
                    <input type="text" value={personalInfo.location} onChange={e => setPersonalInfo({...personalInfo, location: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-[#F8F3F0] focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio</label>
                  <textarea value={personalInfo.bio} onChange={e => setPersonalInfo({...personalInfo, bio: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-[#F8F3F0] focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"></textarea>
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Website</label>
                  <input type="url" value={personalInfo.website} onChange={e => setPersonalInfo({...personalInfo, website: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-[#F8F3F0] focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                </div>
                <motion.button type="submit" className="gradient-primary text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md flex items-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Save className="w-4 h-4" /> Save Changes
                </motion.button>
              </form>
            </Card>

            <Card title="Email & Phone Numbers" index={1}>
              <div className="space-y-3 mb-5">
                {emails.map((email, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-[#F8F3F0]">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{email}</p>
                      <p className="text-xs text-[#014BAA] mt-0.5">Primary email &bull; Verified</p>
                    </div>
                    {emails.length > 1 && (
                      <button onClick={() => setEmails(emails.filter(e => e !== email))} className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-md">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="email" placeholder="Add new email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-[#F8F3F0] focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                <motion.button onClick={() => { if(newEmail) { setEmails([...emails, newEmail]); setNewEmail(''); triggerSave(); } }} className="bg-white border border-gray-200 hover:bg-[#F8F3F0] text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Add
                </motion.button>
              </div>
            </Card>

            <Card title="Account Management" index={2}>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Export your data</h4>
                    <p className="text-xs text-gray-500 mt-1">Download a copy of your profile, projects, and applications.</p>
                  </div>
                  <motion.button onClick={() => triggerSave()} className="mt-3 sm:mt-0 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-[#F8F3F0] rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Download className="w-4 h-4" /> Request Export
                  </motion.button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Reset All Data</h4>
                    <p className="text-xs text-gray-500 mt-1">Clear all localStorage and reset settings to defaults.</p>
                  </div>
                  <motion.button onClick={handleResetAll} className="mt-3 sm:mt-0 px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <RotateCcw className="w-4 h-4" /> Reset All Data
                  </motion.button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Sign Out</h4>
                    <p className="text-xs text-gray-500 mt-1">Sign out of your account on this device.</p>
                  </div>
                  <motion.button onClick={handleSignOut} className="mt-3 sm:mt-0 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <LogOut className="w-4 h-4" /> Sign Out
                  </motion.button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1">
                  <div>
                    <h4 className="text-sm font-semibold text-red-600">Close Account</h4>
                    <p className="text-xs text-gray-500 mt-1">Permanently delete your account and data.</p>
                  </div>
                  <motion.button onClick={() => setShowCloseModal(true)} className="mt-3 sm:mt-0 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    Close Account...
                  </motion.button>
                </div>
              </div>
            </Card>
          </>
        );

      case 'Security & Access':
        return (
          <>
            <SectionHeader title="Security & Access" desc="Keep your account secure across devices." />
            
            <Card title="Change Password" index={0}>
              <form onSubmit={triggerSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
                  <input type="password" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-[#F8F3F0] focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                  <input type="password" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-[#F8F3F0] focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                </div>
                <div className="pb-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                  <input type="password" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-[#F8F3F0] focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                </div>
                <motion.button type="submit" className="gradient-primary text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Update Password
                </motion.button>
              </form>
            </Card>

            <Card index={1}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    Two-Factor Authentication
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${twoFactor ? 'bg-blue-100 text-[#014BAA]' : 'bg-gray-100 text-gray-600'}`}>
                      {twoFactor ? 'Enabled' : 'Disabled'}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
                  <input type="checkbox" className="sr-only peer" checked={twoFactor} onChange={(e) => { setTwoFactor(e.target.checked); triggerSave(); }} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </Card>

            <Card title="Active Sessions" index={2}>
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                  <div className="flex gap-3">
                    <div className="p-2 bg-[#F8F3F0] rounded-lg text-gray-500"><Monitor className="w-5 h-5"/></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">MacBook Pro (macOS)</p>
                      <p className="text-xs text-gray-500 mt-0.5">San Francisco, CA &bull; Chrome</p>
                      <span className="text-[10px] font-bold text-[#014BAA] mt-1 block">CURRENT SESSION</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="p-2 bg-[#F8F3F0] rounded-lg text-gray-500"><Monitor className="w-5 h-5"/></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Windows PC</p>
                      <p className="text-xs text-gray-500 mt-0.5">Seattle, WA &bull; Firefox</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">Last active: 2 hours ago</span>
                    </div>
                  </div>
                  <motion.button onClick={() => triggerSave()} className="text-sm text-gray-600 hover:text-red-600 font-medium px-3 py-1.5 border border-gray-200 hover:border-red-200 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <LogOut className="w-4 h-4" /> Sign Out
                  </motion.button>
                </div>
              </div>
            </Card>
          </>
        );

      case 'Privacy':
        return (
          <>
            <SectionHeader title="Privacy Options" desc="Control who can see your profile and contact you." />
            
            <Card title="Profile Visibility" index={0}>
              <div className="space-y-3">
                {[
                  { id: 'everyone', label: 'Everyone', desc: 'Anyone on the internet can find your profile' },
                  { id: 'only_me', label: 'Only Me', desc: 'Make profile completely private (Ghost mode)' }
                ].map((opt) => (
                  <label key={opt.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-[#F8F3F0] transition-colors">
                    <div className="flex items-center h-5">
                      <input type="radio" name="profileVis" value={opt.id} checked={profileVis === opt.id} onChange={(e) => { setProfileVis(e.target.value); triggerSave(); }} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary focus:ring-2" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Card>

            <Card title="Messaging" index={1}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Who can send you direct messages?</label>
                <select value={msgPerms} onChange={e => { setMsgPerms(e.target.value); triggerSave(); }} className="w-full p-2.5 bg-[#F8F3F0] border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                  <option value="everyone">Everyone</option>
                  <option value="employers">Verified Employers Only</option>
                  <option value="none">No One</option>
                </select>
              </div>
              <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Show Online Status</h4>
                  <p className="text-xs text-gray-500 mt-1">Let others see when you are active on the platform.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
                  <input type="checkbox" className="sr-only peer" checked={showOnline} onChange={(e) => { setShowOnline(e.target.checked); triggerSave(); }} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </Card>

            <Card title="Blocked Users" index={2}>
              <p className="text-sm text-gray-600 mb-4">You have 0 blocked users. They cannot see your profile or send you messages.</p>
              <button className="text-sm font-medium text-primary hover:underline">Manage Blocked Users</button>
            </Card>
          </>
        );

      case 'Notifications':
        return (
          <>
            <SectionHeader title="Notification Preferences" desc="Choose what alerts you receive and how." />
            
            <Card title="In-App Push Notifications" index={0}>
              <div className="space-y-5">
                {[
                  { key: 'jobs', label: 'Job Recommendations', desc: 'When we find a job matching your skills' },
                  { key: 'collab', label: 'Project Collab Requests', desc: 'When someone wants to join your project' },
                  { key: 'comments', label: 'Comments on Posts', desc: 'When someone replies to your feed posts' },
                  { key: 'dms', label: 'Direct Messages', desc: 'When you receive a new chat message' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{item.label}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
                      <input type="checkbox" className="sr-only peer" checked={(notifs as any)[item.key]} onChange={(e) => { setNotifs({...notifs, [item.key]: e.target.checked}); triggerSave(); }} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card title="Email Delivery" index={1}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Email Digest</h4>
                  <p className="text-xs text-gray-500 mt-1">Receive important notifications in your inbox.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
                  <input type="checkbox" className="sr-only peer" checked={notifs.preferEmail} onChange={(e) => { setNotifs({...notifs, preferEmail: e.target.checked}); triggerSave(); }} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </Card>
          </>
        );

      case 'Billing & Payments':
        return (
          <>
            <SectionHeader title="Billing & Payments" desc="Manage your subscription and payment methods." />

            <Card index={0}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-100 flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6 text-[#014BAA]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">Upgrade to Premium</h3>
                    <motion.button
                      onClick={() => setShowProModal(true)}
                      className="gradient-primary text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md whitespace-nowrap shrink-0"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Upgrade Now
                    </motion.button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Get 5x more visibility. Premium jobs appear at the top of search results and get featured on the homepage.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Priority listings', 'Advanced analytics', 'Unlimited posts', 'Verified badge'].map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-[#014BAA] border border-blue-200"
                      >
                        <Star className="w-3 h-3 fill-current" />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
            
            <Card title="Current Plan" index={1}>
              <div className="p-5 border border-blue-200/50 bg-gradient-to-r from-blue-50/50 to-blue-50/30 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-bold text-gray-900">Free Tier</h4>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">ACTIVE</span>
                  </div>
                  <p className="text-sm text-gray-600">Basic access to projects and basic messaging.</p>
                </div>
                <motion.button onClick={() => setShowProModal(true)} className="gradient-primary text-white rounded-xl text-sm font-bold shadow-md whitespace-nowrap px-5 py-2.5" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Upgrade to Pro
                </motion.button>
              </div>
            </Card>

            <Card title="Payment Methods" index={1}>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-gray-800 rounded text-[8px] font-bold text-white flex items-center justify-center shrink-0">VISA</div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Visa ending in 4242</h4>
                    <p className="text-xs text-gray-500">Expires 12/26</p>
                  </div>
                </div>
                <button className="text-sm font-medium text-red-600 hover:text-red-700 py-1 px-2">Remove</button>
              </div>
              <button className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                <Plus className="w-4 h-4" /> Add Payment Method
              </button>
            </Card>

            <Card title="Billing History" index={2}>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#F8F3F0] text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">
                    <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Invoice</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-gray-900">Oct 1, 2023</td>
                      <td className="px-4 py-3 text-gray-900">$0.00</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-100 text-[#014BAA] rounded text-xs font-bold">PAID</span></td>
                      <td className="px-4 py-3 text-right"><button className="text-primary hover:underline font-medium text-xs">Download</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        );

      case 'Appearance':
        return (
          <>
            <SectionHeader title="Appearance" desc="Customize the look and feel of your workspace." />
            
            <Card title="Theme" index={0}>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-medium text-gray-700">Dark Mode Toggle</span>
                <DarkModeToggle
                  isDark={theme === 'dark'}
                  onToggle={() => {
                    const next = theme === 'dark' ? 'light' : 'dark';
                    setTheme(next);
                    triggerSave();
                  }}
                />
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500 mb-3">Or select manually:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'light', icon: <Sun className="w-6 h-6 mb-2" />, label: 'Light Mode' },
                    { id: 'dark', icon: <Moon className="w-6 h-6 mb-2" />, label: 'Dark Mode' },
                    { id: 'system', icon: <Monitor className="w-6 h-6 mb-2" />, label: 'System Default' }
                  ].map((t) => (
                    <motion.button 
                      key={t.id}
                      onClick={() => { setTheme(t.id); triggerSave(); }}
                      className={`flex flex-col items-center justify-center p-6 border-2 rounded-xl transition-all ${theme === t.id ? 'border-blue-400 bg-gradient-to-r from-blue-50/50 to-blue-50/30 text-[#014BAA]' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-[#F8F3F0]'}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {t.icon}
                      <span className="font-semibold text-sm">{t.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                <span className="font-bold">Note:</span> Dark mode dynamically adjusts background and text colors to reduce eye strain in low-light environments.
              </div>
            </Card>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div className="max-w-5xl mx-auto w-full pb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Breadcrumb items={[{ label: 'Settings' }]} />
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">Manage your account preferences and customize your experience.</p>
        </div>
        <AnimatePresence>
          {savedDataStatus && (
            <motion.div 
              className="bg-blue-50 text-[#014BAA] px-4 py-2 rounded-lg border border-blue-200 flex items-center gap-2 text-sm font-medium shrink-0"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle className="w-4 h-4" /> {savedDataStatus}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-100 bg-[#F8F3F0]/50 p-4 shrink-0">
          <nav className="space-y-1.5 md:sticky md:top-4 overflow-x-auto md:overflow-visible flex md:block whitespace-nowrap custom-scrollbar pb-2 md:pb-0">
            {sections.map((section) => (
              <motion.button 
                key={section.title}
                onClick={() => setActiveSection(section.title)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeSection === section.title 
                    ? 'bg-white text-primary shadow-sm border border-gray-200 shadow-gray-200/50' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {section.icon}
                {section.title}
              </motion.button>
            ))}
          </nav>
        </div>
        
        <div className="flex-1 p-6 md:p-8 md:px-10 bg-[#F8F3F0]/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      <AnimatePresence>
        {showCloseModal && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Close Account?</h2>
              <p className="text-gray-600 text-sm mb-6">Are you sure you want to permanently delete your account? This action cannot be undone and all data will be lost.</p>
              <div className="flex gap-3 justify-center">
                <motion.button onClick={() => setShowCloseModal(false)} className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Cancel
                </motion.button>
                <motion.button onClick={() => setShowCloseModal(false)} className="px-5 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-colors flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Delete Account
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProModal && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Upgrade to Pro</h2>
                <motion.button onClick={() => setShowProModal(false)} className="text-gray-400 hover:text-gray-600" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <X className="w-5 h-5"/>
                </motion.button>
              </div>
              <div className="p-6">
                <div className="flex justify-center mb-6">
                  <div className="text-center bg-[#F8F3F0] border border-gray-100 p-6 rounded-2xl w-full max-w-[200px]">
                    <span className="text-5xl font-extrabold text-gray-900">$12</span><span className="text-gray-500 font-medium">/mo</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8 max-w-sm mx-auto">
                  {['Unlimited active projects', 'Premium profile badge', 'Advanced analytics & views', 'Priority job applications'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <motion.button onClick={() => { setShowProModal(false); triggerSave(); }} className="w-full py-3 gradient-primary text-white rounded-xl font-bold shadow-md" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Confirm Upgrade
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
