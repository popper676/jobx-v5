import { Briefcase } from 'lucide-react';

export default function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#F8F3F0]">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-[#014BAA]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Loading Jobx</p>
          <p className="text-xs text-gray-500 mt-1">Preparing your workspace...</p>
        </div>
      </div>
    </div>
  );
}
