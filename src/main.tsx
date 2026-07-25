import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { StoreProvider } from './store/StoreProvider';
import { RoleProvider } from './context/RoleContext';
import './index.css';

// Seed a demo account + profile if none exists
(function seedDemo() {
  const accountsKey = 'jobx_accounts';
  const existing = JSON.parse(localStorage.getItem(accountsKey) || '[]');
  const demoEmail = 'demo@jobx.com';
  if (!existing.some((a: any) => a?.email?.toLowerCase() === demoEmail)) {
    existing.unshift({ id: 'demo-001', name: 'Alex Rivera', email: demoEmail, password: 'password123' });
    localStorage.setItem(accountsKey, JSON.stringify(existing));
  }

  const userKey = 'jobx_user';
  const currentUser = JSON.parse(localStorage.getItem(userKey) || '{}');
  if (!currentUser.email || currentUser.email.toLowerCase() === demoEmail) {
    localStorage.setItem(userKey, JSON.stringify({
      id: 'demo-001',
      name: 'Alex Rivera',
      email: demoEmail,
      avatar: '/assets/alex-rivera-ai-profile.png',
      title: 'Full Stack Developer',
      bio: 'Passionate developer building the future of work.',
      location: 'San Francisco, CA',
      website: '',
      skills: [],
      connections: 342,
      profileViews: 89,
      endorsements: 14,
      experience: [],
      profileCompleted: true,
    }));
  }
})();

const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <RoleProvider>
        <App />
      </RoleProvider>
    </StoreProvider>
  </StrictMode>,
);
