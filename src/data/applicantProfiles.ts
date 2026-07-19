import { Application } from '../types';

export interface ApplicantProfile {
  email: string;
  location: string;
  availability: string;
  about: string;
  skills: Array<{ name: string; verified?: boolean }>;
  experience: Array<{
    role: string;
    company: string;
    period: string;
    achievement: string;
  }>;
  education: {
    qualification: string;
    school: string;
    period: string;
  };
  proofHighlights: Array<{
    title: string;
    description: string;
    signal: string;
  }>;
}

const applicantProfiles: Record<string, ApplicantProfile> = {
  user_2: {
    email: 'sarah.chen@example.com',
    location: 'San Francisco, CA',
    availability: 'Available in 2 weeks',
    about: 'Frontend engineer focused on accessible design systems, performance, and product experiences that scale across teams.',
    skills: [
      { name: 'React', verified: true },
      { name: 'TypeScript', verified: true },
      { name: 'Next.js', verified: true },
      { name: 'Accessibility' },
      { name: 'Design systems' },
    ],
    experience: [
      {
        role: 'Senior Frontend Engineer',
        company: 'Northstar Labs',
        period: '2023 — Present',
        achievement: 'Led a React platform refresh that improved release speed by 35% and raised accessibility coverage across core flows.',
      },
      {
        role: 'Frontend Engineer',
        company: 'Launchpad',
        period: '2020 — 2023',
        achievement: 'Built the shared component library used by four product squads and reduced repeated UI work.',
      },
    ],
    education: {
      qualification: 'B.Sc. Computer Science',
      school: 'University of California, Davis',
      period: '2016 — 2020',
    },
    proofHighlights: [
      {
        title: 'Accessible commerce dashboard',
        description: 'Production React case study with measured performance and accessibility improvements.',
        signal: 'Live project',
      },
      {
        title: 'Open-source component library',
        description: 'Maintainer activity demonstrates reusable API design, documentation, and testing habits.',
        signal: 'GitHub verified',
      },
    ],
  },
  user_3: {
    email: 'james.wilson@example.com',
    location: 'Austin, TX',
    availability: 'Open to interviews',
    about: 'Frontend lead who turns complex product requirements into clear technical plans and reliable, high-quality releases.',
    skills: [
      { name: 'React', verified: true },
      { name: 'JavaScript', verified: true },
      { name: 'Team leadership', verified: true },
      { name: 'Architecture' },
      { name: 'Mentoring' },
    ],
    experience: [
      {
        role: 'Frontend Lead',
        company: 'Beacon Software',
        period: '2022 — Present',
        achievement: 'Guides an eight-person frontend team and introduced release checks that reduced production regressions by 40%.',
      },
      {
        role: 'Senior UI Engineer',
        company: 'Clearpath',
        period: '2019 — 2022',
        achievement: 'Modernized a legacy customer portal and improved its largest workflow completion rate.',
      },
    ],
    education: {
      qualification: 'B.S. Software Engineering',
      school: 'University of Texas at Dallas',
      period: '2015 — 2019',
    },
    proofHighlights: [
      {
        title: 'Frontend migration playbook',
        description: 'A phased migration plan covering risk, testing, observability, and team ownership.',
        signal: 'Case study',
      },
      {
        title: 'Engineering leadership notes',
        description: 'Public writing on mentoring, technical decisions, and sustainable delivery practices.',
        signal: 'Published work',
      },
    ],
  },
  user_4: {
    email: 'maria.garcia@example.com',
    location: 'Madrid, Spain · Remote',
    availability: 'Available now',
    about: 'React and TypeScript specialist with a strong eye for interaction details, maintainable UI architecture, and developer experience.',
    skills: [
      { name: 'React', verified: true },
      { name: 'TypeScript', verified: true },
      { name: 'Testing Library', verified: true },
      { name: 'Storybook' },
      { name: 'CSS architecture' },
    ],
    experience: [
      {
        role: 'React & TypeScript Specialist',
        company: 'Studio Norte',
        period: '2022 — Present',
        achievement: 'Designed a typed UI foundation that cut onboarding time and made product experiments safer to ship.',
      },
      {
        role: 'Frontend Developer',
        company: 'Orbit Digital',
        period: '2019 — 2022',
        achievement: 'Delivered responsive customer journeys for international products across web and mobile breakpoints.',
      },
    ],
    education: {
      qualification: 'B.Eng. Computer Engineering',
      school: 'Universidad Politécnica de Madrid',
      period: '2015 — 2019',
    },
    proofHighlights: [
      {
        title: 'Typed form toolkit',
        description: 'Reusable React patterns showing validation, accessibility, testing, and API error handling.',
        signal: 'GitHub verified',
      },
      {
        title: 'Design system contribution',
        description: 'Documented component decisions with before-and-after adoption outcomes.',
        signal: 'Team endorsed',
      },
    ],
  },
};

export function getApplicantProfile(application: Application): ApplicantProfile {
  return applicantProfiles[application.candidateId] || {
    email: `${application.candidateName.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '')}@example.com`,
    location: 'Remote · Location flexible',
    availability: 'Open to opportunities',
    about: `${application.candidateName} is a ${application.candidateHeadline.toLowerCase()} with experience relevant to ${application.jobTitle}.`,
    skills: [
      { name: application.candidateHeadline.split(' ')[0] || 'Role expertise', verified: true },
      { name: 'Collaboration' },
      { name: 'Problem solving' },
    ],
    experience: [
      {
        role: application.candidateHeadline,
        company: 'Previous company',
        period: 'Recent experience',
        achievement: 'Relevant experience and outcomes are ready to discuss during the first interview.',
      },
    ],
    education: {
      qualification: 'Candidate-provided education',
      school: 'Available during interview',
      period: '—',
    },
    proofHighlights: [
      {
        title: 'JobX skill profile',
        description: 'Role skills and work evidence shared through the candidate profile.',
        signal: `${application.matchScore}% role match`,
      },
    ],
  };
}
