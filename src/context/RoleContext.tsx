import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

export type UserRole = 'seeker' | 'employer';

interface RoleContextValue {
  role: UserRole;
  isTransitioning: boolean;
  toggleRole: () => void;
  setRole: (role: UserRole) => void;
}

const STORAGE_KEY = 'jobx_role';

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
  const [role, setRoleState] = useState<UserRole>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return stored === 'employer' ? 'employer' : 'seeker';
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, role);
  }, [role]);

  const toggleRole = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setRoleState((prev) => (prev === 'seeker' ? 'employer' : 'seeker'));
      setIsTransitioning(false);
    }, 700);
  }, []);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
  }, []);

  return (
    <RoleContext.Provider value={{ role, isTransitioning, toggleRole, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
