import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, User, MapPin, FileText, Code, Building2, Plus, X, ArrowRight, CheckCircle2, SkipForward, Camera } from 'lucide-react';
import { useStore } from '../store/StoreProvider';

export default function ProfileSetupOverlay() {
  const store = useStore();
  const [step, setStep] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [form, setForm] = useState({
    title: '',
    bio: '',
    location: '',
    website: '',
    skills: [''] as string[],
    experience: [{ role: '', company: '', duration: '', period: '', description: '' }],
  });

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateSkill = (index: number, value: string) => {
    const skills = [...form.skills];
    skills[index] = value;
    setForm(prev => ({ ...prev, skills }));
  };

  const addSkill = () => {
    setForm(prev => ({ ...prev, skills: [...prev.skills, ''] }));
  };

  const removeSkill = (index: number) => {
    setForm(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const exp = [...form.experience];
    exp[index] = { ...exp[index], [field]: value };
    setForm(prev => ({ ...prev, experience: exp }));
  };

  const addExperience = () => {
    setForm(prev => ({ ...prev, experience: [...prev.experience, { role: '', company: '', duration: '', period: '', description: '' }] }));
  };

  const removeExperience = (index: number) => {
    setForm(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setAvatarPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const steps = [
    { title: 'Basic Info', icon: <User className="w-5 h-5" /> },
    { title: 'Skills', icon: <Code className="w-5 h-5" />, skippable: true },
    { title: 'Experience', icon: <Building2 className="w-5 h-5" />, skippable: true },
  ];

  const canNext = () => {
    if (step === 0) return form.title.trim() !== '' && form.location.trim() !== '';
    return true;
  };

  const handleComplete = () => {
    const validSkills = form.skills.filter(s => s.trim() !== '').map(s => ({ skill: s.trim(), endorsements: 0 }));
    const validExperience = form.experience.filter(e => e.role.trim() || e.company.trim()).map(e => ({
      role: e.role.trim(),
      company: e.company.trim(),
      duration: e.duration.trim(),
      period: e.period.trim(),
      description: e.description.trim(),
    }));
    store.completeProfile({
      title: form.title.trim(),
      bio: form.bio.trim(),
      location: form.location.trim(),
      website: form.website.trim(),
      avatar: avatarPreview,
      skills: validSkills,
      experience: validExperience,
    });
  };

  const skipStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const initials = store.user.name ? store.user.name.charAt(0).toUpperCase() : '?';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-gray-200"
      >
        <div className="gradient-header px-6 py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Complete Your Profile</h2>
              <p className="text-sm text-white/80">Fill in your details to get started</p>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            {steps.map((s, i) => (
              <button
                key={i}
                onClick={() => { if (i <= step) setStep(i); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  i === step
                    ? 'bg-white text-[#014BAA]'
                    : i < step
                    ? 'bg-white/30 text-white'
                    : 'bg-white/10 text-white/50'
                }`}
              >
                {s.icon}
                <span className="hidden sm:inline">{s.title}</span>
                {i < step && <span className="text-[#014BAA]">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="basic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                <div className="flex justify-center mb-2">
                  <div className="relative group">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-md" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center border-4 border-white shadow-lg">
                        <span className="text-4xl font-bold text-white">{initials}</span>
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer border border-gray-200 hover:bg-[#F8F3F0] transition-colors">
                      <Camera className="w-4 h-4 text-gray-600" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1">
                    <Briefcase className="w-4 h-4 text-gray-400" /> Professional Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    placeholder="e.g. Full Stack Developer | React, Node.js"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 text-gray-400" /> Location *
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    placeholder="e.g. Yangon, Myanmar"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1">
                    <FileText className="w-4 h-4 text-gray-400" /> Bio
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1">
                    <User className="w-4 h-4 text-gray-400" /> Website <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    placeholder="e.g. github.com/yourname"
                  />
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="skills" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Add your skills for others to endorse.</p>
                  <button onClick={skipStep} className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                    Skip <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>
                {form.skills.map((skill, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => updateSkill(i, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      placeholder={`Skill ${i + 1}`}
                    />
                    {form.skills.length > 1 && (
                      <button onClick={() => removeSkill(i)} className="text-gray-400 hover:text-red-500 p-2">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addSkill} className="flex items-center gap-1.5 text-sm font-medium text-[#014BAA] hover:text-[#014BAA] mt-1">
                  <Plus className="w-4 h-4" /> Add Skill
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="experience" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Add your work experience.</p>
                  <button onClick={skipStep} className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                    Skip <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>
                {form.experience.map((exp, i) => (
                  <div key={i} className="bg-[#F8F3F0] rounded-xl p-4 border border-gray-100 space-y-3 relative">
                    {form.experience.length > 1 && (
                      <button onClick={() => removeExperience(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Building2 className="w-4 h-4 text-gray-400" /> Experience {i + 1}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => updateExperience(i, 'role', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        placeholder="Role / Position"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(i, 'company', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        placeholder="Company"
                      />
                      <input
                        type="text"
                        value={exp.period}
                        onChange={(e) => updateExperience(i, 'period', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        placeholder="e.g. Jan 2022 - Present"
                      />
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => updateExperience(i, 'duration', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        placeholder="e.g. 2 yrs 5 mos"
                      />
                    </div>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(i, 'description', e.target.value)}
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                      placeholder="Brief description of your work..."
                    />
                  </div>
                ))}
                <button onClick={addExperience} className="flex items-center gap-1.5 text-sm font-medium text-[#014BAA] hover:text-[#014BAA]">
                  <Plus className="w-4 h-4" /> Add Experience
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-[#F8F3F0]/50">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-8 bg-blue-500' : i < step ? 'w-4 bg-blue-300' : 'w-4 bg-gray-200'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-[#F8F3F0] rounded-lg transition-colors"
              >
                Back
              </motion.button>
            )}
            {steps[step].skippable && step === steps.length - 1 ? (
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={skipStep}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 hover:bg-[#F8F3F0] rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <SkipForward className="w-4 h-4" /> Skip
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleComplete}
                  className="px-5 py-2 text-sm font-medium text-white gradient-primary rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
                >
                  Complete <CheckCircle2 className="w-4 h-4" />
                </motion.button>
              </div>
            ) : step < steps.length - 1 ? (
              <div className="flex gap-2">
                {steps[step].skippable && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={skipStep}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 hover:bg-[#F8F3F0] rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <SkipForward className="w-4 h-4" /> Skip
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { if (canNext()) setStep(step + 1); }}
                  disabled={!canNext()}
                  className="px-5 py-2 text-sm font-medium text-white gradient-primary rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-500/20 disabled:opacity-50"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleComplete}
                className="px-5 py-2 text-sm font-medium text-white gradient-primary rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
              >
                Complete <CheckCircle2 className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
