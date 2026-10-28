import { Route, Routes, Link } from 'react-router-dom';
import { Component, lazy, Suspense } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import LandingPage from './pages/landing/LandingPage';
import AuthPage from './pages/auth/AuthPage';
import { AppLayout, RequireAuth, TaskLayout } from './layouts/AppLayout';
import { Brand, Button, Loading, buttonClass } from './components/ui';
import styles from './App.module.css';
import { AuthProtection } from '@/auth/components/auth-protection';
import { Toaster } from 'sonner';


/* Must be lazy loaded until they are needed.  */
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const TasksPage = lazy(() => import('./pages/tasks/TasksPage'));
const TaskDetailPage = lazy(() => import('./pages/tasks/TaskDetailPage'));
const ProposalFormPage = lazy(() => import('./pages/proposal/ProposalFormPage'));
const ProposalsPage = lazy(() => import('./pages/proposal/ProposalsPage'));
const BusinessTasksPage = lazy(() => import('./pages/business-tasks/BusinessTasksPage'));
const CreateTaskPage = lazy(() => import('./pages/business-tasks/CreateTaskPage'));
const ManageTaskPage = lazy(() => import('./pages/business-tasks/ManageTaskPage'));
const AssignmentsPage = lazy(() => import('./pages/assignments/AssignmentsPage'));
const AssignmentPage = lazy(() => import('./pages/assignments/AssignmentPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const VerificationPage = lazy(() => import('./pages/verification/VerificationPage'));
const VerificationCodePage = lazy(() => import('./pages/verification/VerificationCodePage'));

class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    /* Errors are displayed without logging private page data. */
  }
  render() {
    return this.state.failed ? (
      <main className={styles.page}>
        <Brand />
        <h1 className={styles.title}>This page couldn’t load.</h1>
        <p>Please reload and try again.</p>
        <Button onClick={() => window.location.reload()}>Reload page</Button>
      </main>
    ) : (
      this.props.children
    );
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <Toaster position='bottom-right' richColors/>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage register />} />
          <Route element={<AuthProtection />}>
            <Route element={<TaskLayout />}>
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/tasks/:id" element={<TaskDetailPage />} />
              <Route path="/profiles/:id" element={<ProfilePage />} />
            </Route>
          </Route>
          <Route element={<AuthProtection />}>
            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route path="/assignments" element={<AssignmentsPage />} />
                <Route path="/assignments/:id" element={<AssignmentPage />} />
                <Route
                  path="/assignments/:id/agreement"
                  element={<AssignmentPage view="agreement" />}
                />
                <Route path="/assignments/:id/submit" element={<AssignmentPage view="submit" />} />
                <Route path="/assignments/:id/review" element={<AssignmentPage view="review" />} />
                <Route
                  path="/assignments/:id/validation"
                  element={<AssignmentPage view="validation" />}
                />
                <Route path="/profile" element={<ProfilePage />} />
                {/* settings is student-only for now; companies have no Student profile */}
                <Route element={<RequireAuth role="student" />}>
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
                <Route path="/verification" element={<VerificationPage />} />
                <Route path='/verification-code' element={<VerificationCodePage />} />
              </Route>
            </Route>
            <Route element={<RequireAuth role="student" />}>
              <Route element={<AppLayout />}>
                <Route path="/student" element={<DashboardPage />} />
                <Route path="/student/proposals" element={<ProposalsPage />} />
                <Route path="/tasks/:id/propose" element={<ProposalFormPage />} />
              </Route>
            </Route>
            <Route element={<RequireAuth role="company" />}>
              <Route element={<AppLayout />}>
                <Route path="/business" element={<DashboardPage />} />
                <Route path="/business/tasks" element={<BusinessTasksPage />} />
                <Route path="/business/tasks/new" element={<CreateTaskPage />} />
                <Route path="/business/tasks/:id/proposals" element={<ManageTaskPage />} />
              </Route>
            </Route>
          </Route>
          <Route
            path="*"
            element={
              <main className={styles.page}>
                <Brand />
                <h1 className={styles.title}>This page hasn’t sprung up yet.</h1>
                <p>The link may be incorrect or the page may have moved.</p>
                <Link to="/" className={buttonClass()}>
                  Back to home
                </Link>
              </main>
            }
          />
        </Routes>
      </Suspense>
    </AppErrorBoundary>
  );
}
