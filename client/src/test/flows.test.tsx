import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthPage from '../pages/AuthPage';
import LandingPage from '../pages/LandingPage';
import TasksPage from '../pages/TasksPage';
import { RequireAuth } from '../layouts/AppLayout';
import { AssignmentPage } from '../pages/AssignmentsPage';
const student = { id: 'student-1', first_name: 'Isaac', last_name: 'Tester', role: 'student' };
const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
function mount(element: React.ReactNode, path = '/') {
  const cache = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={cache}>
      <MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  window.localStorage.clear();
});
afterEach(() => vi.unstubAllGlobals());
test('landing links lead to real routes and example opportunities are labeled', () => {
  mount(<LandingPage />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Real work. Real skills.');
  expect(screen.getByText(/Illustrative tasks/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Post a task/ })).toHaveAttribute(
    'href',
    '/register?role=company',
  );
});
test('login submits credentials, uses the server session, and navigates to the student dashboard', async () => {
  const fetcher = vi.fn(async (url: string) =>
    url.endsWith('/auth/me')
      ? json({ error: { message: 'Log in' } }, 401)
      : json({ user: student }),
  );
  vi.stubGlobal('fetch', fetcher);
  mount(
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/student" element={<h1>Student dashboard</h1>} />
    </Routes>,
    '/login',
  );
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Email address'), 'student@example.test');
  await user.type(screen.getByLabelText('Password'), 'Testing-password-123!');
  await user.click(screen.getByRole('button', { name: /Log in/ }));
  expect(await screen.findByRole('heading', { name: 'Student dashboard' })).toBeInTheDocument();
  expect(fetcher).toHaveBeenCalledWith(
    '/api/auth/login',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'student@example.test', password: 'Testing-password-123!' }),
    }),
  );
  expect(window.localStorage.length).toBe(0);
});
test('role guard redirects students away from business actions', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => json({ user: student })),
  );
  mount(
    <Routes>
      <Route element={<RequireAuth role="company" />}>
        <Route path="/business/tasks/new" element={<h1>Restricted form</h1>} />
      </Route>
      <Route path="/student" element={<h1>Student overview</h1>} />
    </Routes>,
    '/business/tasks/new',
  );
  expect(await screen.findByRole('heading', { name: 'Student overview' })).toBeInTheDocument();
  expect(screen.queryByText('Restricted form')).not.toBeInTheDocument();
});
test('task browsing shows recoverable API errors instead of fake results', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => json({ error: { message: 'Service unavailable' } }, 503)),
  );
  mount(<TasksPage />, '/tasks');
  expect(await screen.findByRole('alert')).toHaveTextContent('Service unavailable');
  expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  expect(screen.queryByText('0 open opportunities')).not.toBeInTheDocument();
});
test('validation UI never describes archive checks as successful code execution', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) =>
      url.endsWith('/auth/me')
        ? json({ user: student })
        : json({
            assignment: {
              id: 'a',
              task: { id: 't', title: 'Build a view', company: { name: 'Test Co' } },
              student,
              status: 'submitted',
            },
            agreement: null,
            files: [],
            submissions: [{ id: 's', version: 1 }],
            reviews: [],
            validations: [
              {
                id: 'v',
                submission: 's',
                status: 'passed',
                file_count: 2,
                uncompressed_bytes: 100,
                findings: [],
                execution: 'not_run',
              },
            ],
          }),
    ),
  );
  mount(
    <Routes>
      <Route path="/assignments/:id/validation" element={<AssignmentPage view="validation" />} />
    </Routes>,
    '/assignments/a/validation',
  );
  expect(await screen.findByText('Code execution is unavailable.')).toBeInTheDocument();
  expect(screen.getByText('Execution: not run')).toBeInTheDocument();
  expect(screen.getByText('Archive checks passed')).toBeInTheDocument();
});
