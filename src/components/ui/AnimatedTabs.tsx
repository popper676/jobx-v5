import React from "react";
import { motion } from "motion/react";

export interface AnimatedTabsProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
  className?: string;
}

// Basic utility to merge classnames if missing
const cx = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");

export default function AnimatedTabs({ tabs, activeTab, onChange, className }: AnimatedTabsProps) {
  return (
    <div className={cx("flex items-center gap-2 p-1 bg-gray-100/80 rounded-full border border-gray-200/60 shadow-inner", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab;

        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={cx(
              "relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors outline-none",
              isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {isActive && (
              <motion.div
                layoutId="animated-tabs-indicator"
                className="absolute inset-0 bg-white rounded-full shadow-sm border border-gray-200/50"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        );
      })}
    </div>
  );
}
