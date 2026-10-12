import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AuthPage from '../pages/auth/AuthPage';
import LandingPage from '../pages/landing/LandingPage';
import { RequireAuth } from '../layouts/AppLayout';
import AssignmentPage from '../pages/assignments/AssignmentPage';
function mount(element: React.ReactNode, path = '/') {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>
    </QueryClientProvider>,
  );
}
test('landing links lead to real routes and example opportunities are labeled', () => {
  mount(<LandingPage />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('experience you can prove');
  expect(screen.getByText(/Illustrative tasks/)).toBeInTheDocument();
  for (const link of screen.getAllByRole('link', { name: /Post a task/ })) {
    expect(link).toHaveAttribute('href', '/register?role=company');
  }
});
test('role guard redirects students away from business actions', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(
      JSON.stringify({
        email: 'ada@example.com',
        first_name: 'Ada',
        last_name: 'Lovelace',
        role: 'student',
        created_at: '2026-01-01T00:00:00.000Z',
        Student: {
          university: null,
          graduation_year: null,
          verification_status: 'unverified',
          bio: null,
          github_url: null,
        },
      }),
    ),
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
test('validation UI never describes archive checks as successful code execution', () => {
  mount(
    <Routes>
      <Route path="/assignments/:id/validation" element={<AssignmentPage view="validation" />} />
    </Routes>,
    '/assignments/a/validation',
  );
  expect(screen.getByText('Code execution is unavailable.')).toBeInTheDocument();
  expect(screen.getByText('Execution: not run')).toBeInTheDocument();
  expect(screen.getByText('Archive checks passed')).toBeInTheDocument();
});
test('login shows zod field errors under the inputs and clears them on edit', async () => {
  mount(<AuthPage />, '/login');
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Email address'), 'not-an-email');
  await user.click(screen.getByRole('button', { name: /Log in/ }));
  expect(await screen.findByText('enter a valid email')).toBeInTheDocument();
  expect(screen.getByText('password is required')).toBeInTheDocument();
  await user.type(screen.getByLabelText('Email address'), 'x');
  expect(screen.queryByText('enter a valid email')).not.toBeInTheDocument();
});
test('student registration posts the mapped body and shows server errors', async () => {
  const fetchSpy = vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(
      new Response(JSON.stringify({ message: 'Check your email to continue' }), { status: 409 }),
    );
  mount(<AuthPage register />, '/register');
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('First name'), 'Ada');
  await user.type(screen.getByLabelText('Last name'), 'Lovelace');
  await user.type(screen.getByLabelText('Email address'), 'ada@example.com');
  await user.type(screen.getByLabelText('Password'), 'a-long-password');
  await user.click(screen.getByRole('button', { name: /Create account/ }));
  expect(await screen.findByText('Check your email to continue')).toBeInTheDocument();
  expect(fetchSpy).toHaveBeenCalledWith(
    '/api/auth/student-register',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        password: 'a-long-password',
      }),
    }),
  );
});
