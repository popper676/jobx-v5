import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="mb-5 flex items-center gap-2 text-sm text-gray-500">
      <Link
        to="/employer"
        className="product-focus inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 font-bold text-[#173b67] shadow-sm transition hover:border-[#173b67] hover:bg-[#edf2f7]"
      >
        <ArrowLeft className="h-4 w-4" />Back to dashboard
      </Link>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          {item.path ? (
            <Link
              to={item.path}
              className="hover:text-[#014BAA] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gray-900">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
