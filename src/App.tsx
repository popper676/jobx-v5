import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import PageFallback from './components/PageFallback';
import { useStore } from './store/StoreProvider';

const Landing = lazy(() => import('./pages/Landing'));
const Jobs = lazy(() => import('./pages/Jobs'));
const Search = lazy(() => import('./pages/Search'));
const JobDetail = lazy(() => import('./pages/JobDetail'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage'));
const EmployerDashboard = lazy(() => import('./pages/EmployerDashboard'));
const EmployerSettingsPage = lazy(() => import('./pages/EmployerSettingsPage'));
const PostJobPage = lazy(() => import('./pages/PostJobPage'));
const MyPostsPage = lazy(() => import('./pages/MyPostsPage'));
const ViewApplicantsPage = lazy(() => import('./pages/ViewApplicantsPage'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'));
const CareerCoach = lazy(() => import('./pages/CareerCoach'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Messages = lazy(() => import('./pages/Messages'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ProofHub = lazy(() => import('./pages/ProofHub'));
const CompanyProfile = lazy(() => import('./pages/CompanyProfile'));
const EmployerAITools = lazy(() => import('./pages/EmployerAITools'));
const EmployerCandidates = lazy(() => import('./pages/EmployerCandidates'));
const EmployerCandidateProfile = lazy(() => import('./pages/EmployerCandidateProfile'));
const EmployerOperations = lazy(() => import('./pages/EmployerOperations'));
const EmployerInterviewCenter = lazy(() => import('./pages/EmployerInterviewCenter'));
const MyNetwork = lazy(() => import('./pages/MyNetwork'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const store = useStore();
  if (!store.auth.isAuthenticated) return <Navigate to="/landing" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const store = useStore();
  if (store.auth.isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="search" element={<Search />} />
              <Route path="jobs/:id" element={<JobDetail />} />
              <Route path="companies/:companyName" element={<CompanyProfile />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="network" element={<MyNetwork />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="employer" element={<EmployerDashboard />} />
              <Route path="employer/settings" element={<EmployerSettingsPage />} />
              <Route path="employer/ai-tools" element={<EmployerAITools />} />
              <Route path="employer/candidates" element={<EmployerCandidates />} />
              <Route path="employer/candidates/:id" element={<EmployerCandidateProfile />} />
              <Route path="employer/rates" element={<EmployerOperations />} />
              <Route path="employer/analytics" element={<EmployerOperations />} />
              <Route path="employer/challenges" element={<EmployerOperations />} />
              <Route path="employer/interviews" element={<EmployerInterviewCenter />} />
              <Route path="my-posts" element={<MyPostsPage />} />
              <Route path="post-job" element={<PostJobPage />} />
              <Route path="applicants" element={<ViewApplicantsPage />} />
              <Route path="resume" element={<ResumeBuilder />} />
              <Route path="career-coach" element={<CareerCoach />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="missions" element={<ProofHub />} />
              <Route path="tests" element={<ProofHub />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="messages" element={<Messages />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="landing" element={<PublicRoute><Landing /></PublicRoute>} />
            <Route path="signin" element={<PublicRoute><SignIn /></PublicRoute>} />
            <Route path="signup" element={<PublicRoute><SignUp /></PublicRoute>} />
            <Route
              path="studio"
              element={(
                <ProtectedRoute>
                  <main className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-[1500px]"><ResumeBuilder /></div>
                  </main>
                </ProtectedRoute>
              )}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
