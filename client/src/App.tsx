import { Route, Routes, Link } from 'react-router-dom';
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import { ProposalFormPage, ProposalsPage } from './pages/ProposalPage';
import { BusinessTasksPage, CreateTaskPage, ManageTaskPage } from './pages/BusinessTasksPage';
import { AssignmentPage, AssignmentsPage } from './pages/AssignmentsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import VerificationPage from './pages/VerificationPage';
import { AppLayout, RequireAuth, TaskLayout } from './layouts/AppLayout';
import { Brand, Button } from './components/ui';
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
      <main className="container py-12">
        <Brand />
        <h1 className="mt-8">This page couldn’t load.</h1>
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
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage register />} />
        <Route element={<TaskLayout />}>
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/profiles/:id" element={<ProfilePage />} />
        </Route>
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
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/verification" element={<VerificationPage />} />
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
        <Route
          path="*"
          element={
            <main className="container py-12">
              <Brand />
              <h1 className="mt-8">This page hasn’t sprung up yet.</h1>
              <p>The link may be incorrect or the page may have moved.</p>
              <Link to="/" className="button button-primary">
                Back to home
              </Link>
            </main>
          }
        />
      </Routes>
    </AppErrorBoundary>
  );
}
