export interface SampleCandidate {
  id: string;
  name: string;
  title: string;
  location: string;
  skills: string[];
  matchScore: number;
}

export interface SampleEmployer {
  id: string;
  name: string;
  industry: string;
  location: string;
  verified: boolean;
  responseRate: number;
}

const firstNames = ['Amina', 'Arjun', 'Chloe', 'Daniel', 'Elena', 'Farah', 'Grace', 'Hana', 'Isaac', 'Jia', 'Kai', 'Lena', 'Mateo', 'Nadia', 'Owen', 'Priya', 'Quinn', 'Ravi', 'Sofia', 'Theo'];
const lastNames = ['Adams', 'Bennett', 'Chen', 'Diaz', 'Evans', 'Foster', 'Garcia', 'Hassan', 'Ito', 'Johnson', 'Kim', 'Lopez', 'Morgan', 'Nguyen', 'Okafor', 'Patel', 'Rivera', 'Singh', 'Tan', 'Wilson'];
const candidateRoles = ['Frontend Engineer', 'Product Designer', 'Data Analyst', 'Backend Engineer', 'Growth Marketer', 'UX Researcher', 'Project Manager', 'DevOps Engineer'];
const candidateLocations = ['Kuala Lumpur', 'Singapore', 'San Francisco, CA', 'London', 'Toronto', 'Sydney', 'Remote', 'Berlin'];
const skillSets = [['React', 'TypeScript', 'Accessibility'], ['Figma', 'Design Systems', 'Research'], ['SQL', 'Python', 'Data Visualization'], ['Node.js', 'AWS', 'APIs'], ['SEO', 'Analytics', 'Content Strategy']];

export const SAMPLE_CANDIDATES: SampleCandidate[] = Array.from({ length: 560 }, (_, index) => ({
  id: `sample-candidate-${index + 1}`,
  name: `${firstNames[index % firstNames.length]}${index >= 400 ? ` ${String.fromCharCode(65 + (index % 26))}.` : ''} ${lastNames[Math.floor(index / firstNames.length) % lastNames.length]}`,
  title: candidateRoles[index % candidateRoles.length],
  location: candidateLocations[index % candidateLocations.length],
  skills: skillSets[index % skillSets.length],
  matchScore: 68 + (index * 7) % 29,
}));

const employerPrefixes = ['Northstar', 'Lumen', 'Orbit', 'Arc', 'Wave', 'Nexus', 'Bright', 'Vertex', 'Harbor', 'Cedar', 'Atlas', 'Nova', 'Summit'];
const employerSuffixes = ['Labs', 'Systems', 'Studio', 'Health', 'Commerce', 'Works', 'Cloud', 'Collective', 'Digital', 'Group'];
const industries = ['Software', 'Financial Technology', 'Healthcare', 'E-commerce', 'Design Services', 'Data & AI', 'Clean Technology', 'Education'];
const employerLocations = ['Malaysia', 'Singapore', 'United States', 'United Kingdom', 'Australia', 'Germany', 'Canada', 'Remote-first'];

export const SAMPLE_EMPLOYERS: SampleEmployer[] = Array.from({ length: 520 }, (_, index) => ({
  id: `sample-employer-${index + 1}`,
  name: `${employerPrefixes[index % employerPrefixes.length]} ${employerSuffixes[(index * 3) % employerSuffixes.length]} ${index + 1}`,
  industry: industries[index % industries.length],
  location: employerLocations[index % employerLocations.length],
  verified: index % 7 !== 0,
  responseRate: 74 + (index * 5) % 25,
}));
