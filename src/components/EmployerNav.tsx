import React from 'react';
import { SpotlightNavbar } from './ui/SpotlightNavbar';

const employerNavLinks = [
  { name: 'Dashboard', path: '/employer' },
  { name: 'Post Job', path: '/post-job' },
  { name: 'Tools', path: '/employer/tools' },
  { name: 'Settings', path: '/employer/settings' },
];

export default function EmployerNav() {
  return (
    <div className="hidden md:flex flex-1 items-center justify-center">
      <SpotlightNavbar 
        items={employerNavLinks.map(link => ({ label: link.name, href: link.path }))} 
      />
    </div>
  );
}
