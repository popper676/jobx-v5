import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
      <Link
        to="/employer"
        className="flex items-center gap-1 hover:text-[#014BAA] transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
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
