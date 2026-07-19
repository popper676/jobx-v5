import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/StoreProvider';
import { useRole } from '../context/RoleContext';
import Breadcrumb from '../components/employer/Breadcrumb';
import UserAvatar from '../components/UserAvatar';
import {
  Building2, CreditCard, Users, Save, Upload, Globe, MapPin, Calendar, Briefcase,
  Mail, Shield, Crown, Star, Zap, CheckCircle, X, Plus, Trash2, Download, ChevronDown,
  Lock, ExternalLink, Hash, Phone, AlertTriangle, MoreHorizontal, Pencil, Send,
  BadgeCheck, TrendingUp, Receipt, Wallet, ArrowUpRight
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type TabKey = 'company' | 'billing' | 'team';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Recruiter' | 'Viewer';
  avatar?: string;
  status: 'active' | 'pending';
  joinedAt: string;
  jobsAccess: boolean;
  billingAccess: boolean;
  settingsAccess: boolean;
};

type BillingRecord = {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Failed';
};

type PaymentMethod = {
  id: string;
  type: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expMonth: string;
  expYear: string;
  isDefault: boolean;
};

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const INITIAL_TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'Alex Rivera',
    email: 'alex@techcorp.com',
    role: 'Owner',
    status: 'active',
    joinedAt: 'Jan 15, 2023',
    jobsAccess: true,
    billingAccess: true,
    settingsAccess: true,
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@techcorp.com',
    role: 'Admin',
    status: 'active',
    joinedAt: 'Mar 22, 2023',
    jobsAccess: true,
    billingAccess: true,
    settingsAccess: false,
  },
  {
    id: '3',
    name: 'James Wilson',
    email: 'james@techcorp.com',
    role: 'Recruiter',
    status: 'active',
    joinedAt: 'Jun 10, 2023',
    jobsAccess: true,
    billingAccess: false,
    settingsAccess: false,
  },
  {
    id: '4',
    name: 'Pending User',
    email: 'newhire@techcorp.com',
    role: 'Viewer',
    status: 'pending',
    joinedAt: '—',
    jobsAccess: false,
    billingAccess: false,
    settingsAccess: false,
  },
];

const BILLING_HISTORY: BillingRecord[] = [
  { id: 'b1', date: 'May 1, 2024', description: 'Pro Plan — Monthly', amount: '$49.00', status: 'Paid' },
  { id: 'b2', date: 'Apr 1, 2024', description: 'Pro Plan — Monthly', amount: '$49.00', status: 'Paid' },
  { id: 'b3', date: 'Mar 1, 2024', description: 'Pro Plan — Monthly', amount: '$49.00', status: 'Paid' },
  { id: 'b4', date: 'Feb 15, 2024', description: 'Job Promotion — Senior Dev', amount: '$50.00', status: 'Paid' },
  { id: 'b5', date: 'Feb 1, 2024', description: 'Starter Plan — Monthly', amount: '$0.00', status: 'Paid' },
];

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'p1', type: 'visa', last4: '4242', expMonth: '12', expYear: '26', isDefault: true },
  { id: 'p2', type: 'mastercard', last4: '8888', expMonth: '08', expYear: '25', isDefault: false },
];

const PLAN_FEATURES = {
  free: ['3 active job posts', 'Basic applicant tracking', 'Company profile', 'Email support'],
  pro: ['Unlimited job posts', 'Advanced analytics', 'Promoted listings', 'Priority support', 'Team members (5)', 'Custom branding'],
  enterprise: ['Everything in Pro', 'Dedicated account manager', 'API access', 'SSO / SAML', 'Unlimited team members', 'SLA guarantee'],
};

/* ------------------------------------------------------------------ */
/*  Helper components                                                  */
/* ------------------------------------------------------------------ */
const Card = ({ children, title, index = 0, className = '' }: { children: React.ReactNode; title?: string; index?: number; className?: string }) => (
  <motion.div
    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
  >
    {title && <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>}
    {children}
  </motion.div>
);

const SectionHeader = ({ title, desc }: { title: string; desc: string }) => (
  <motion.div className="mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    <p className="text-sm text-gray-500 mt-1">{desc}</p>
  </motion.div>
);

const Input = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <input
      {...props}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-[#F8F3F0] focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
    />
  </div>
);

const TextArea = ({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <textarea
      {...props}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-[#F8F3F0] focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
    />
  </div>
);

const Select = ({ label, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: string[] }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      <select {...props} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-[#F8F3F0] focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none pr-8">
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  </div>
);

const Toggle = ({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) => (
  <div className="flex items-center justify-between">
    <div>
      <h4 className="text-sm font-semibold text-gray-900">{label}</h4>
      {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
    </div>
    <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#014BAA]"></div>
    </label>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function EmployerSettingsPage() {
  const store = useStore();
  const { role } = useRole();
  const [activeTab, setActiveTab] = useState<TabKey>('company');
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  /* ---------- Company profile state ---------- */
  const [company, setCompany] = useState({
    name: 'TechCorp Inc.',
    tagline: 'Building the future of cloud infrastructure',
    website: 'https://techcorp.com',
    location: 'San Francisco, CA',
    industry: 'Software & Technology',
    size: '51–200 employees',
    founded: '2018',
    description:
      'TechCorp is a leading cloud infrastructure provider helping teams scale faster. We believe in remote-first culture and continuous learning.',
    email: 'careers@techcorp.com',
    phone: '+1 (415) 555-0123',
    linkedin: 'https://linkedin.com/company/techcorp',
    twitter: 'https://twitter.com/techcorp',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  /* ---------- Billing state ---------- */
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'enterprise'>('pro');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(PAYMENT_METHODS);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [billingHistory] = useState<BillingRecord[]>(BILLING_HISTORY);

  /* ---------- Team state ---------- */
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('Recruiter');
  const [editMemberId, setEditMemberId] = useState<string | null>(null);

  /* ---------- Helpers ---------- */
  const triggerSave = () => {
    setSavedStatus('Changes saved successfully.');
    setTimeout(() => setSavedStatus(null), 3000);
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'company', label: 'Company Profile', icon: <Building2 className="w-5 h-5" /> },
    { key: 'billing', label: 'Billing & Plan', icon: <CreditCard className="w-5 h-5" /> },
    { key: 'team', label: 'Team Members', icon: <Users className="w-5 h-5" /> },
  ];

  const planMeta = {
    free: { name: 'Free', price: '$0', period: '/month', color: 'bg-gray-100 text-gray-700', cta: 'Current Plan' },
    pro: { name: 'Pro', price: '$49', period: '/month', color: 'bg-blue-100 text-blue-700', cta: 'Current Plan' },
    enterprise: { name: 'Enterprise', price: 'Custom', period: '', color: 'bg-purple-100 text-purple-700', cta: 'Contact Sales' },
  };

  /* ---------- Actions ---------- */
  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    const newMember: TeamMember = {
      id: Math.random().toString(36).slice(2),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'pending',
      joinedAt: '—',
      jobsAccess: inviteRole !== 'Viewer',
      billingAccess: inviteRole === 'Owner' || inviteRole === 'Admin',
      settingsAccess: inviteRole === 'Owner',
    };
    setTeam((prev) => [...prev, newMember]);
    setInviteEmail('');
    setShowInviteModal(false);
    triggerSave();
  };

  const removeMember = (id: string) => {
    setTeam((prev) => prev.filter((m) => m.id !== id));
    triggerSave();
  };

  const updateMemberRole = (id: string, newRole: TeamMember['role']) => {
    setTeam((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              role: newRole,
              jobsAccess: newRole !== 'Viewer',
              billingAccess: newRole === 'Owner' || newRole === 'Admin',
              settingsAccess: newRole === 'Owner',
            }
          : m
      )
    );
    setEditMemberId(null);
    triggerSave();
  };

  const setDefaultCard = (id: string) => {
    setPaymentMethods((prev) => prev.map((p) => ({ ...p, isDefault: p.id === id })));
    triggerSave();
  };

  const removeCard = (id: string) => {
    setPaymentMethods((prev) => prev.filter((p) => p.id !== id));
    triggerSave();
  };

  /* ---------- Renderers ---------- */
  const renderCompanyTab = () => (
    <>
      <SectionHeader title="Company Profile" desc="Manage your public company information and branding." />

      <Card title="Branding" index={0}>
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-md cursor-pointer overflow-hidden border-2 border-blue-200/50"
              onClick={() => logoInputRef.current?.click()}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8" />
              )}
            </div>
            <button
              onClick={() => logoInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => setLogoPreview(reader.result as string);
                reader.readAsDataURL(file);
              }}
            />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">Company Logo</h4>
            <p className="text-xs text-gray-500 mt-1">Recommended 400×400px PNG or JPG. Max 2MB.</p>
          </div>
        </div>
      </Card>

      <Card title="Basic Information" index={1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Input label="Company Name *" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
          <Input label="Tagline" value={company.tagline} onChange={(e) => setCompany({ ...company, tagline: e.target.value })} />
          <Select
            label="Industry"
            value={company.industry}
            options={['Software & Technology', 'Finance & Banking', 'Healthcare', 'Education', 'E-commerce', 'Manufacturing', 'Consulting', 'Other']}
            onChange={(e) => setCompany({ ...company, industry: e.target.value })}
          />
          <Select
            label="Company Size"
            value={company.size}
            options={['1–10 employees', '11–50 employees', '51–200 employees', '201–500 employees', '501–1000 employees', '1000+ employees']}
            onChange={(e) => setCompany({ ...company, size: e.target.value })}
          />
          <Input label="Founded Year" value={company.founded} onChange={(e) => setCompany({ ...company, founded: e.target.value })} />
          <Input label="Website" value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} />
        </div>
        <TextArea label="About the Company" rows={4} value={company.description} onChange={(e) => setCompany({ ...company, description: e.target.value })} />
      </Card>

      <Card title="Contact & Social" index={2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Input
            label="Location"
            value={company.location}
            onChange={(e) => setCompany({ ...company, location: e.target.value })}
            icon={<MapPin className="w-4 h-4 text-gray-400" />}
          />
          <Input
            label="Careers Email"
            value={company.email}
            onChange={(e) => setCompany({ ...company, email: e.target.value })}
            icon={<Mail className="w-4 h-4 text-gray-400" />}
          />
          <Input
            label="Phone"
            value={company.phone}
            onChange={(e) => setCompany({ ...company, phone: e.target.value })}
            icon={<Phone className="w-4 h-4 text-gray-400" />}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 mt-2">
          <Input
            label="LinkedIn"
            value={company.linkedin}
            onChange={(e) => setCompany({ ...company, linkedin: e.target.value })}
            icon={<ExternalLink className="w-4 h-4 text-gray-400" />}
          />
          <Input
            label="Twitter / X"
            value={company.twitter}
            onChange={(e) => setCompany({ ...company, twitter: e.target.value })}
            icon={<ExternalLink className="w-4 h-4 text-gray-400" />}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <motion.button
          onClick={triggerSave}
          className="gradient-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Save className="w-4 h-4" /> Save Changes
        </motion.button>
      </div>
    </>
  );

  const renderBillingTab = () => (
    <>
      <SectionHeader title="Billing & Subscription" desc="Manage your plan, payment methods, and invoices." />

      {/* Current plan banner */}
      <Card index={0} className="!p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">{planMeta[currentPlan].name} Plan</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${planMeta[currentPlan].color}`}>Active</span>
                </div>
                <p className="text-sm text-gray-500">Renews on Jun 1, 2024</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {PLAN_FEATURES[currentPlan].map((f) => (
                <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  <CheckCircle className="w-3 h-3" /> {f}
                </span>
              ))}
            </div>
          </div>
          <div className="md:w-56 bg-[#F8F3F0]/80 border-t md:border-t-0 md:border-l border-gray-100 p-6 flex flex-col justify-center items-center">
            <div className="text-center">
              <span className="text-3xl font-extrabold text-gray-900">{planMeta[currentPlan].price}</span>
              <span className="text-gray-500 font-medium">{planMeta[currentPlan].period}</span>
            </div>
            <motion.button
              onClick={() => setShowUpgradeModal(true)}
              className="mt-4 w-full gradient-primary text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {currentPlan === 'enterprise' ? 'Contact Sales' : 'Change Plan'}
            </motion.button>
          </div>
        </div>
      </Card>

      {/* Usage stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active Jobs', value: '8 / ∞', icon: <Briefcase className="w-5 h-5" />, pct: 40 },
          { label: 'Promoted Listings', value: '2 / 5', icon: <Zap className="w-5 h-5" />, pct: 40 },
          { label: 'Team Seats', value: `${team.filter((m) => m.status === 'active').length} / 5`, icon: <Users className="w-5 h-5" />, pct: 60 },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-50 text-[#014BAA]">{stat.icon}</div>
              <span className="text-xs font-medium text-gray-400">This cycle</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" initial={{ width: 0 }} animate={{ width: `${stat.pct}%` }} transition={{ duration: 0.8, delay: 0.3 }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Payment methods */}
      <Card title="Payment Methods" index={2}>
        <div className="space-y-3">
          {paymentMethods.map((pm) => (
            <div key={pm.id} className={`flex items-center justify-between p-4 border rounded-xl transition-all ${pm.isDefault ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-6 rounded text-[8px] font-bold text-white flex items-center justify-center shrink-0 uppercase ${pm.type === 'visa' ? 'bg-blue-800' : pm.type === 'mastercard' ? 'bg-orange-600' : 'bg-gray-700'}`}>
                  {pm.type}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {pm.type.charAt(0).toUpperCase() + pm.type.slice(1)} ending in {pm.last4}
                  </p>
                  <p className="text-xs text-gray-500">
                    Expires {pm.expMonth}/{pm.expYear}
                  </p>
                </div>
                {pm.isDefault && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">Default</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!pm.isDefault && (
                  <button onClick={() => setDefaultCard(pm.id)} className="text-xs font-medium text-[#014BAA] hover:underline px-2 py-1">
                    Set Default
                  </button>
                )}
                <button onClick={() => removeCard(pm.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <motion.button
          onClick={() => setShowAddCardModal(true)}
          className="mt-4 flex items-center gap-2 text-sm font-medium text-[#014BAA] hover:underline"
          whileHover={{ scale: 1.01 }}
        >
          <Plus className="w-4 h-4" /> Add Payment Method
        </motion.button>
      </Card>

      {/* Billing history */}
      <Card title="Billing History" index={3}>
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F3F0] text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {billingHistory.map((b) => (
                <tr key={b.id} className="hover:bg-[#F8F3F0]/50 transition-colors">
                  <td className="px-4 py-3 text-gray-900 whitespace-nowrap">{b.date}</td>
                  <td className="px-4 py-3 text-gray-700">{b.description}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{b.amount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        b.status === 'Paid'
                          ? 'bg-blue-100 text-blue-700'
                          : b.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-[#014BAA] hover:underline font-medium text-xs flex items-center gap-1 justify-end ml-auto">
                      <Download className="w-3 h-3" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );

  const renderTeamTab = () => (
    <>
      <SectionHeader title="Team Members" desc="Manage who can access and manage your company account." />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Members', value: team.length, icon: <Users className="w-5 h-5" />, color: 'from-blue-500 to-indigo-600' },
          { label: 'Active', value: team.filter((m) => m.status === 'active').length, icon: <BadgeCheck className="w-5 h-5" />, color: 'from-emerald-500 to-emerald-600' },
          { label: 'Pending Invites', value: team.filter((m) => m.status === 'pending').length, icon: <Mail className="w-5 h-5" />, color: 'from-amber-500 to-amber-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-md`}>{stat.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Invite button */}
      <div className="flex justify-end mb-4">
        <motion.button
          onClick={() => setShowInviteModal(true)}
          className="gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" /> Invite Member
        </motion.button>
      </div>

      {/* Team table */}
      <Card index={0} className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F3F0] text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Permissions</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {team.map((member) => (
                <tr key={member.id} className="hover:bg-[#F8F3F0]/50 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar src={member.avatar} name={member.name} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        member.role === 'Owner'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : member.role === 'Admin'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : member.role === 'Recruiter'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {member.role === 'Owner' && <Shield className="w-3 h-3" />}
                      {member.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        member.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-sm">{member.joinedAt}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1.5">
                      {member.jobsAccess && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded" title="Jobs">
                          J
                        </span>
                      )}
                      {member.billingAccess && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded" title="Billing">
                          $
                        </span>
                      )}
                      {member.settingsAccess && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded" title="Settings">
                          S
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {member.role !== 'Owner' && (
                        <>
                          <button
                            onClick={() => setEditMemberId(member.id)}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Change role"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeMember(member.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Permissions legend */}
      <Card title="Role Permissions" index={1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { role: 'Owner', desc: 'Full access. Can manage billing, team, settings, and all jobs.', color: 'bg-purple-50 text-purple-700 border-purple-200' },
            { role: 'Admin', desc: 'Can manage jobs, view billing, and invite team members.', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { role: 'Recruiter', desc: 'Can post, edit, and manage jobs. Cannot access billing or settings.', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            { role: 'Viewer', desc: 'Read-only access to jobs and applicants. Cannot make changes.', color: 'bg-gray-100 text-gray-700 border-gray-200' },
          ].map((r) => (
            <div key={r.role} className="flex items-start gap-3 p-3 border rounded-lg">
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border shrink-0 mt-0.5 ${r.color}`}>{r.role}</span>
              <p className="text-xs text-gray-600 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );

  /* ---------- Tabs switch ---------- */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'company':
        return renderCompanyTab();
      case 'billing':
        return renderBillingTab();
      case 'team':
        return renderTeamTab();
    }
  };

  return (
    <motion.div className="max-w-5xl mx-auto w-full pb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Breadcrumb items={[{ label: 'Settings' }]} />

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employer Settings</h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">Manage your company profile, subscription, and team.</p>
        </div>
        <AnimatePresence>
          {savedStatus && (
            <motion.div
              className="bg-blue-50 text-[#014BAA] px-4 py-2 rounded-lg border border-blue-200 flex items-center gap-2 text-sm font-medium shrink-0"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle className="w-4 h-4" /> {savedStatus}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-100 bg-[#F8F3F0]/50 p-4 shrink-0">
          <nav className="space-y-1.5 md:sticky md:top-4 overflow-x-auto md:overflow-visible flex md:block whitespace-nowrap custom-scrollbar pb-2 md:pb-0">
            {tabs.map((tab) => (
              <motion.button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all w-full ${
                  activeTab === tab.key
                    ? 'bg-white text-[#014BAA] shadow-sm border border-gray-200 shadow-gray-200/50'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab.icon}
                {tab.label}
              </motion.button>
            ))}
          </nav>

          {/* Mini plan badge */}
          <div className="hidden md:block mt-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-[#014BAA]" />
              <span className="text-xs font-bold text-blue-900">{planMeta[currentPlan].name} Plan</span>
            </div>
            <p className="text-[11px] text-blue-700/80 leading-relaxed">{PLAN_FEATURES[currentPlan].slice(0, 2).join(' · ')}</p>
            <button onClick={() => setActiveTab('billing')} className="mt-2 text-[11px] font-semibold text-[#014BAA] hover:underline flex items-center gap-1">
              Manage <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-8 md:px-10 bg-[#F8F3F0]/30">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ---- Modals ---- */}

      {/* Invite Member Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Invite Team Member</h2>
                <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-[#F8F3F0] focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
                  <div className="relative">
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as TeamMember['role'])}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-[#F8F3F0] focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none pr-8"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Recruiter">Recruiter</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-xs text-blue-700 leading-relaxed">
                    <span className="font-semibold">{inviteRole}</span> can {inviteRole === 'Admin' ? 'manage jobs, view billing, and invite members.' : inviteRole === 'Recruiter' ? 'post and manage jobs only.' : 'view jobs and applicants read-only.'}
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                <button onClick={() => setShowInviteModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <motion.button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim()}
                  className="flex-1 px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: inviteEmail.trim() ? 1.02 : 1 }}
                  whileTap={{ scale: inviteEmail.trim() ? 0.98 : 1 }}
                >
                  <Send className="w-4 h-4" /> Send Invite
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Role Modal */}
      <AnimatePresence>
        {editMemberId && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Change Role</h2>
                <p className="text-sm text-gray-500 mt-1">{team.find((m) => m.id === editMemberId)?.name}</p>
              </div>
              <div className="p-6 space-y-2">
                {(['Admin', 'Recruiter', 'Viewer'] as TeamMember['role'][]).map((r) => (
                  <button
                    key={r}
                    onClick={() => updateMemberRole(editMemberId, r)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                      team.find((m) => m.id === editMemberId)?.role === r
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-[#F8F3F0] text-gray-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-gray-100">
                <button onClick={() => setEditMemberId(null)} className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Plan Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Choose Your Plan</h2>
                <button onClick={() => setShowUpgradeModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['free', 'pro', 'enterprise'] as const).map((plan) => {
                    const isActive = currentPlan === plan;
                    return (
                      <motion.button
                        key={plan}
                        onClick={() => setCurrentPlan(plan)}
                        className={`relative text-left p-5 rounded-xl border-2 transition-all ${
                          isActive ? 'border-[#014BAA] bg-blue-50/30 shadow-md' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {isActive && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#014BAA] text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Current</div>
                        )}
                        <div className="mb-3">
                          <h3 className="text-base font-bold text-gray-900">{planMeta[plan].name}</h3>
                          <p className="text-2xl font-extrabold text-gray-900 mt-1">
                            {planMeta[plan].price}
                            <span className="text-sm font-medium text-gray-500">{planMeta[plan].period}</span>
                          </p>
                        </div>
                        <ul className="space-y-2">
                          {PLAN_FEATURES[plan].map((f) => (
                            <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                              <CheckCircle className="w-3.5 h-3.5 text-[#014BAA] shrink-0 mt-0.5" /> {f}
                            </li>
                          ))}
                        </ul>
                      </motion.button>
                    );
                  })}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setShowUpgradeModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <motion.button
                    onClick={() => {
                      setShowUpgradeModal(false);
                      triggerSave();
                    }}
                    className="px-5 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Confirm Plan
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Card Modal */}
      <AnimatePresence>
        {showAddCardModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Add Payment Method</h2>
                <button onClick={() => setShowAddCardModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-[#F8F3F0] focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all pl-10"
                    />
                    <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-[#F8F3F0] focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">CVC</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-[#F8F3F0] focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                <button onClick={() => setShowAddCardModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <motion.button
                  onClick={() => {
                    setShowAddCardModal(false);
                    triggerSave();
                  }}
                  className="flex-1 px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold shadow-md flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4" /> Add Card
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
