import { Link } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <SearchX className="w-7 h-7 text-[#014BAA]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-5">Page not found</h1>
        <p className="text-sm text-gray-500 mt-2">
          This page may have moved, or the link is no longer available.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#014BAA] text-white text-sm font-semibold hover:bg-[#013b86] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
