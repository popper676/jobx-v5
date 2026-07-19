import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Clock, ChevronRight, CheckSquare, Square, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import UserAvatar from '../UserAvatar';

export type ApplicantStatus = 'New' | 'Viewed' | 'Shortlisted' | 'Rejected';

export interface ApplicantRow {
  id: string;
  name: string;
  avatar: string;
  headline: string;
  appliedJob: string;
  appliedAt: string;
  matchScore: number;
  status: ApplicantStatus;
}

interface ApplicantTableProps {
  applicants: ApplicantRow[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  onAction?: (id: string, action: 'shortlist' | 'reject' | 'view') => void;
  onBatchAction?: (ids: string[], action: 'shortlist' | 'reject' | 'delete') => void;
}

const statusConfig: Record<ApplicantStatus, { label: string; className: string; rowBorder: string }> = {
  New:         { label: 'New',         className: 'bg-blue-50 text-blue-700 border-blue-200',   rowBorder: 'border-l-blue-400' },
  Viewed:      { label: 'Viewed',      className: 'bg-[#F8F3F0] text-gray-600 border-gray-200',    rowBorder: 'border-l-gray-300' },
  Shortlisted: { label: 'Shortlisted', className: 'bg-blue-50 text-[#014BAA] border-blue-200', rowBorder: 'border-l-blue-400' },
  Rejected:    { label: 'Rejected',    className: 'bg-red-50 text-red-700 border-red-200',      rowBorder: 'border-l-red-400' },
};

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ApplicantTable({
  applicants,
  selectedId,
  onSelect,
  onAction,
  onBatchAction,
}: ApplicantTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === applicants.length && applicants.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applicants.map((a) => a.id)));
    }
  };

  const allSelected = applicants.length > 0 && selectedIds.size === applicants.length;
  const someSelected = selectedIds.size > 0;
  const batchIds: string[] = Array.from(selectedIds);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="hidden sm:grid grid-cols-[40px_1fr_140px_100px_90px_100px_80px] gap-3 px-5 py-3 bg-[#F8F3F0]/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider items-center">
        <button
          onClick={toggleAll}
          className="flex items-center justify-center text-gray-400 hover:text-[#014BAA] transition-colors"
        >
          {allSelected ? (
            <CheckSquare className="w-4 h-4 text-[#014BAA]" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>
        <span>Applicant</span>
        <span>Applied Job</span>
        <span>Date</span>
        <span>Match</span>
        <span>Status</span>
        <span className="text-right">Actions</span>
      </div>

      {/* Batch actions bar */}
      <AnimatePresence>
        {someSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-blue-50 border-b border-blue-100 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-5 py-2.5">
              <span className="text-sm font-semibold text-[#014BAA] mr-2">
                {selectedIds.size} selected
              </span>
              <button
                onClick={() => { onBatchAction?.(batchIds, 'shortlist'); setSelectedIds(new Set()); }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[#014BAA] bg-white border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Shortlist
              </button>
              <button
                onClick={() => { onBatchAction?.(batchIds, 'reject'); setSelectedIds(new Set()); }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>
              <button
                onClick={() => { onBatchAction?.(batchIds, 'delete'); setSelectedIds(new Set()); }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-[#F8F3F0] transition-colors ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="divide-y divide-gray-50">
        {applicants.map((a, i) => {
          const isActive = selectedId === a.id;
          const isChecked = selectedIds.has(a.id);
          const status = statusConfig[a.status];

          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onSelect?.(a.id)}
              className={`group grid grid-cols-1 sm:grid-cols-[40px_1fr_140px_100px_90px_100px_80px] gap-3 px-5 py-4 items-center cursor-pointer transition-all ${
                isActive
                  ? 'bg-blue-50/30'
                  : 'hover:bg-[#F8F3F0]/60'
              } border-l-[3px] ${isActive ? 'border-l-[#014BAA]' : status.rowBorder}`}
            >
              {/* Checkbox */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleRow(a.id); }}
                className="flex items-center justify-center text-gray-400 hover:text-[#014BAA] transition-colors hidden sm:flex"
              >
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-[#014BAA]" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>

              {/* Applicant */}
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar src={a.avatar} name={a.name} size="sm" className="w-9 h-9 shrink-0" />
                <div className="min-w-0">
                  <h4 className={`text-sm font-semibold truncate ${isActive ? 'text-[#014BAA]' : 'text-gray-900'}`}>
                    {a.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">{a.headline}</p>
                </div>
              </div>

              {/* Applied Job */}
              <span className="text-sm text-gray-700 truncate hidden sm:block">{a.appliedJob}</span>

              {/* Date */}
              <span className="text-xs text-gray-400 flex items-center gap-1 hidden sm:flex">
                <Clock className="w-3 h-3" />
                {timeAgo(a.appliedAt)}
              </span>

              {/* Match % */}
              <div className="hidden sm:flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-[#014BAA] fill-current" />
                <span className="text-sm font-bold text-gray-900">{a.matchScore}%</span>
              </div>

              {/* Status badge */}
              <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border w-fit ${status.className}`}>
                {status.label}
              </span>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction?.(a.id, 'view');
                  }}
                  className="p-1.5 text-gray-400 hover:text-[#014BAA] hover:bg-blue-50 rounded-lg transition-colors"
                  title="View"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile-only compact info */}
              <div className="sm:hidden col-span-full flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-500">{a.appliedJob}</span>
                <span className="text-xs text-gray-400">{timeAgo(a.appliedAt)}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.className}`}>
                  {status.label}
                </span>
                <span className="text-xs font-bold text-[#014BAA] ml-auto">{a.matchScore}%</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {applicants.length === 0 && (
        <div className="px-5 py-10 text-center text-sm text-gray-400">
          No applicants found.
        </div>
      )}
    </div>
  );
}
