import { useRole } from '../context/RoleContext';

export default function RoleTransitionScreen() {
  const { role, isTransitioning } = useRole();

  const targetLabel = role === 'seeker' ? 'Employer' : 'Seeker';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isTransitioning ? 1 : 0,
        pointerEvents: isTransitioning ? 'auto' : 'none',
        transition: 'opacity 300ms ease-in-out',
      }}
    >
      <div
        style={{
          animation: isTransitioning ? 'role-briefcase-rotate 1.2s ease-in-out infinite' : 'none',
          marginBottom: '1.5rem',
        }}
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#334155"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            animation: isTransitioning ? 'role-briefcase-rotate 1.2s ease-in-out infinite' : 'none',
          }}
        >
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <line x1="12" y1="12" x2="12" y2="12" />
        </svg>
      </div>

      <p
        style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#1e293b',
          marginBottom: '2rem',
        }}
      >
        Switching to {targetLabel} mode...
      </p>

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '4px',
          backgroundColor: '#e2e8f0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#3b82f6',
            transform: isTransitioning ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 700ms linear',
          }}
        />
      </div>

      <style>{`
        @keyframes role-briefcase-rotate {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(6deg); }
          75% { transform: rotate(-6deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
