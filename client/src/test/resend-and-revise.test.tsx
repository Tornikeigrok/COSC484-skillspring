import { afterEach, expect, test, vi } from 'vitest';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { strToU8, zipSync } from 'fflate';
import { toast } from 'sonner';
import VerificationCodePage from '../pages/verification/VerificationCodePage';
import { useCooldown } from '../pages/verification/hooks/use-cooldown';
import ReviseTaskPage from '../pages/business-tasks/ReviseTaskPage';
import RejectionNotice from '../pages/business-tasks/components/rejected-task-note';
import type { CompanyTask } from '../pages/business-tasks/hooks';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

type Handler = () => Response | Promise<Response>;

/** Answers fetch by "METHOD /path" and remembers every call so tests can inspect what was sent */
function mockApi(routes: Record<string, Handler>) {
  const calls: { key: string; body: BodyInit | null | undefined }[] = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const key = `${init?.method ?? 'GET'} ${String(input)}`;
    calls.push({ key, body: init?.body });
    const handler = routes[key];
    return handler ? await handler() : json(404, { message: `unmocked ${key}` });
  });
  return calls;
}

function mount(element: React.ReactNode, path: string) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>
    </QueryClientProvider>,
  );
}

const profileBase = { email: 'ada@example.com', first_name: 'Ada', last_name: 'Lovelace', created_at: '2026-01-01T00:00:00.000Z' };
const studentProfile = {
  ...profileBase,
  role: 'student',
  Student: { university: 'Towson University', graduation_year: 2027, verification_status: 'unverified', bio: null, github_url: null, skills: [] },
};
const companyProfile = {
  ...profileBase,
  role: 'company',
  Company: { name: 'Acme', website: 'https://acme.com', description: null, verification_status: 'verified' },
};

/* ----------------------------- resend the code ----------------------------- */

async function openCodePage(role: 'student' | 'company', resend: Handler) {
  const calls = mockApi({
    'GET /api/auth/authenticate-user': () => json(200, { role }),
    'GET /api/student/profile': () => json(200, studentProfile),
    'GET /api/company/profile': () => json(200, companyProfile),
    [`POST /api/${role}/resend-verification`]: resend,
  });
  const user = userEvent.setup();
  mount(<VerificationCodePage />, '/verification/code');
  const button = await screen.findByRole('button', { name: 'resend the code' });
  await waitFor(() => expect(button).toBeEnabled()); // enabled once we know who is logged in
  return { calls, user, button };
}

const digitInputs = () => Array.from({ length: 6 }, (_, i) => screen.getByLabelText(`Digit ${i + 1}`) as HTMLInputElement);

test.each([
  ['student', '/api/student/resend-verification', '/api/company/resend-verification'],
  ['company', '/api/company/resend-verification', '/api/student/resend-verification'],
] as const)('%s: resend calls their own endpoint, clears the old digits and starts a cooldown', async (role, expected, other) => {
  const { calls, user, button } = await openCodePage(role, () => json(200, { verification_email_sent: true }));

  await user.click(digitInputs()[0]);
  await user.paste('123456');
  expect(digitInputs().map((i) => i.value).join('')).toBe('123456');

  await user.click(button);

  expect(await screen.findByRole('status')).toHaveTextContent('We sent you a new code');
  expect(calls.filter((c) => c.key === `POST ${expected}`)).toHaveLength(1);
  expect(calls.some((c) => c.key === `POST ${other}`)).toBe(false);
  // the server replaced the code, so the digits typed so far are stale
  expect(digitInputs().every((i) => i.value === '')).toBe(true);
  expect(digitInputs()[0]).toHaveFocus();
  // and the link waits, like the server does
  const waiting = screen.getByRole('button', { name: /resend in \d+s/ });
  expect(waiting).toBeDisabled();
});

test('a slow resend cannot be double-submitted and shows that it is sending', async () => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve));
  const { calls, user, button } = await openCodePage('student', async () => {
    await gate;
    return json(200, { verification_email_sent: true });
  });

  await user.click(button);
  const sending = await screen.findByRole('button', { name: 'sending…' });
  expect(sending).toBeDisabled();
  await user.click(sending);
  await user.click(sending);
  release();

  await screen.findByRole('status');
  expect(calls.filter((c) => c.key === 'POST /api/student/resend-verification')).toHaveLength(1);
});

test('when the server refuses (cooldown / limit) the message is shown and typed digits are kept', async () => {
  const { user, button } = await openCodePage('company', () =>
    json(400, { message: 'Please wait a minute before requesting a new code' }),
  );

  await user.click(digitInputs()[0]);
  await user.paste('987');
  await user.click(button);

  expect(await screen.findByRole('alert')).toHaveTextContent('Please wait a minute before requesting a new code');
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(digitInputs().slice(0, 3).map((i) => i.value).join('')).toBe('987');
  // a refused request is not a cooldown we can measure, so they can try again
  expect(screen.getByRole('button', { name: 'resend the code' })).toBeEnabled();
});

test('typing a new code dismisses the resend notice', async () => {
  const { user, button } = await openCodePage('student', () => json(200, { verification_email_sent: true }));
  await user.click(button);
  await screen.findByRole('status');

  await user.click(digitInputs()[0]);
  await user.keyboard('4');

  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
});

test('useCooldown counts down in seconds and frees the button at zero', () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useCooldown());
  expect(result.current.remaining).toBe(0);

  act(() => result.current.start(3));
  expect(result.current.remaining).toBe(3);

  act(() => void vi.advanceTimersByTime(1000));
  expect(result.current.remaining).toBe(2);

  act(() => void vi.advanceTimersByTime(2500));
  expect(result.current.remaining).toBe(0);

  // and it can be started again
  act(() => result.current.start(2));
  expect(result.current.remaining).toBe(2);
});

/* ----------------------------- revise a rejected task ----------------------------- */

const rejectedTask: CompanyTask = {
  id: 7,
  title: 'Bakery landing page',
  description: 'Create a responsive landing page for a small bakery with a hero section and a menu list.',
  difficulty: 'easy',
  estimated_hours: 12,
  deadline: '2099-06-01T12:00:00.000Z',
  status: 'rejected',
  task_type: 'api',
  created_at: '2026-02-01T00:00:00.000Z',
  rejected_reason: ['Blocked file type: evil.exe', 'Description asks for credentials'],
};

function openRevisePage(id: string, tasks: CompanyTask[], extra: Record<string, Handler> = {}) {
  const calls = mockApi({
    'GET /api/company/profile': () => json(200, companyProfile),
    'GET /api/company/tasks': () => json(200, tasks),
    ...extra,
  });
  mount(
    <Routes>
      <Route path="/business/tasks/:id/revise" element={<ReviseTaskPage />} />
      <Route path="/business/tasks" element={<h1>Task list</h1>} />
    </Routes>,
    `/business/tasks/${id}/revise`,
  );
  return calls;
}

const realZip = () => {
  const bytes = zipSync({ 'README.md': strToU8('# starter') });
  // jsdom's File has no arrayBuffer(); the form's zip check needs it
  const file = new File([bytes], 'starter-v2.zip', { type: 'application/zip' });
  Object.defineProperty(file, 'arrayBuffer', { value: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) });
  return file;
};

test('the revise page pre-fills the rejected task and lists why it was rejected', async () => {
  openRevisePage('7', [rejectedTask]);

  expect(await screen.findByRole('heading', { name: 'Revise your task' })).toBeInTheDocument();
  const why = screen.getByRole('note', { name: 'Why this task was rejected' });
  expect(why).toHaveTextContent('Blocked file type: evil.exe');
  expect(why).toHaveTextContent('Description asks for credentials');

  expect(screen.getByLabelText('Title *')).toHaveValue('Bakery landing page');
  expect(screen.getByLabelText('Description *')).toHaveValue(rejectedTask.description);
  expect(screen.getByLabelText('Estimated hours *')).toHaveValue(12);
  expect(screen.getByRole('radio', { name: /Easy/ })).toBeChecked();
  expect(screen.getByRole('radio', { name: /Medium/ })).not.toBeChecked();
  expect(screen.getByLabelText('Type *')).toHaveTextContent('API');
  expect(screen.getByRole('button', { name: 'Resubmit for review' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Publish task' })).not.toBeInTheDocument();
});

test('resubmitting needs a new zip: without one nothing is sent', async () => {
  const calls = openRevisePage('7', [rejectedTask]);
  const user = userEvent.setup();

  await user.click(await screen.findByRole('button', { name: 'Resubmit for review' }));

  expect(await screen.findByText('please upload a zip file')).toBeInTheDocument();
  expect(calls.some((c) => c.key.startsWith('POST'))).toBe(false);
});

test('resubmitting sends the SAME task id with the edited fields and the new zip, then returns to the list', async () => {
  const successSpy = vi.spyOn(toast, 'success').mockImplementation(() => '');
  const calls = openRevisePage('7', [rejectedTask], {
    'POST /api/company/revise-task/7': () => json(200, { fileStored: true, id: 7 }),
  });
  const user = userEvent.setup();

  const title = await screen.findByLabelText('Title *');
  await user.clear(title);
  await user.type(title, 'Bakery landing page v2');
  await user.upload(screen.getByLabelText(/Starter files/), realZip());
  await user.click(screen.getByRole('button', { name: 'Resubmit for review' }));

  expect(await screen.findByRole('heading', { name: 'Task list' })).toBeInTheDocument();
  const posts = calls.filter((c) => c.key.startsWith('POST'));
  expect(posts.map((c) => c.key)).toEqual(['POST /api/company/revise-task/7']); // no new task is created
  const form = posts[0].body as FormData;
  expect(form.get('taskTitle')).toBe('Bakery landing page v2');
  expect(form.get('taskDesc')).toBe(rejectedTask.description);
  expect(form.get('taskType')).toBe('api');
  expect(form.get('difficulty')).toBe('easy');
  expect(form.get('estimated_hours')).toBe('12');
  expect(new Date(form.get('deadline') as string).toLocaleDateString('en-CA')).toBe('2099-06-01');
  expect((form.get('file') as File).name).toBe('starter-v2.zip');
  expect(successSpy).toHaveBeenCalledWith('Task resubmitted for review');
});

test('a server error is shown to the user and the form stays open', async () => {
  const errorSpy = vi.spyOn(toast, 'error').mockImplementation(() => '');
  openRevisePage('7', [rejectedTask], {
    'POST /api/company/revise-task/7': () => json(429, { message: 'Too many tasks posted, try again later' }),
  });
  const user = userEvent.setup();

  await user.upload(await screen.findByLabelText(/Starter files/), realZip());
  await user.click(screen.getByRole('button', { name: 'Resubmit for review' }));

  await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Too many tasks posted, try again later'));
  expect(screen.getByRole('heading', { name: 'Revise your task' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Task list' })).not.toBeInTheDocument();
});

test.each([
  ['a task that is not rejected', '7', { ...rejectedTask, status: 'open' }, "This task can't be revised"],
  ['a task that is already in review', '7', { ...rejectedTask, status: 'in_review' }, "This task can't be revised"],
  ['a task that is not in the list', '99', rejectedTask, 'Task not found'],
  ['an id that is not a number', 'abc', rejectedTask, 'Task not found'],
])('%s shows a message instead of the form', async (_name, id, task, message) => {
  openRevisePage(id, [task]);

  expect(await screen.findByText(message)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Back to tasks' })).toHaveAttribute('href', '/business/tasks');
  expect(screen.queryByLabelText('Title *')).not.toBeInTheDocument();
});

test('the rejection note links to the revise page of THAT task', () => {
  mount(<RejectionNotice taskId={42} reasons={['Blocked file type: evil.exe']} />, '/business/tasks');

  const link = screen.getByRole('link', { name: 'Revise the zip' });
  expect(link).toHaveAttribute('href', '/business/tasks/42/revise');
  expect(screen.getByText('Blocked file type: evil.exe')).toBeInTheDocument();
});
