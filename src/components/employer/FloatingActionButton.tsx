import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Briefcase, Edit3, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { label: 'Post Job', icon: <Edit3 className="w-4 h-4" />, onClick: () => navigate('/post-job') },
    { label: 'My Posts', icon: <Briefcase className="w-4 h-4" />, onClick: () => navigate('/my-posts') },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && actions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            onClick={() => { action.onClick(); setIsOpen(false); }}
            className="flex items-center gap-3 group"
          >
            <span className="text-xs font-medium text-gray-600 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
              {action.label}
            </span>
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:text-[#014BAA] hover:border-blue-200 transition-colors">
              {action.icon}
            </div>
          </motion.button>
        ))}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#014BAA] text-white shadow-lg shadow-blue-500/30 flex items-center justify-center"
      >
        <motion.div
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="w-6 h-6" />
        </motion.div>
      </motion.button>
    </div>
  );
}
