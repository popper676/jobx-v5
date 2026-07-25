import type { MouseEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Job } from '../data';

export default function EmployerProfileLink({ job, children, className = '' }: {
  job: Job;
  children: ReactNode;
  className?: string;
}) {
  const navigate = useNavigate();

  const openProfile = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    navigate(`/companies/${encodeURIComponent(job.company)}`);
  };

  return (
    <button
      type="button"
      onClick={openProfile}
      aria-label={`View ${job.company} company profile`}
      title={`View ${job.company} profile`}
      className={`product-focus shrink-0 rounded-[1.35rem] transition-transform hover:-translate-y-0.5 hover:scale-[1.03] ${className}`}
    >
      {children}
    </button>
  );
}
