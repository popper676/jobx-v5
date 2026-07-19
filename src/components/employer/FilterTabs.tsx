import React from 'react';
import { motion } from 'motion/react';

interface FilterTab {
  label: string;
  key: string;
  count?: number;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  active: string;
  onChange: (key: string) => void;
}

export default function FilterTabs({ tabs, active, onChange }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-1 mb-5 overflow-x-auto scrollbar-hide pb-1">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
          >
            {/* background pill */}
            {isActive && (
              <motion.div
                layoutId="filter-tab-bg"
                className="absolute inset-0 bg-[#014BAA] rounded-xl"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}

            <span className={`relative z-10 ${isActive ? 'text-white' : 'text-gray-600 hover:text-[#014BAA]'}`}>
              {tab.label}
            </span>

            {tab.count !== undefined && (
              <span
                className={`relative z-10 inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-[11px] font-bold ${
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
