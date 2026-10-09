import { afterEach, expect, test, vi } from 'vitest';
import { api, ApiError } from './api';
afterEach(() => vi.unstubAllGlobals());
test('sends credentials and the CSRF header, and preserves structured validation errors', async () => {
  const fetcher = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        error: {
          code: 'validation_error',
          message: 'Check the form.',
          details: [{ path: 'message', message: 'Too short' }],
        },
      }),
      { status: 400 },
    ),
  );
  vi.stubGlobal('fetch', fetcher);
  await expect(
    api('/tasks/id/proposals', { method: 'POST', body: { message: 'x' } }),
  ).rejects.toMatchObject({
    status: 400,
    code: 'validation_error',
    details: [{ path: 'message', message: 'Too short' }],
  });
  expect(fetcher).toHaveBeenCalledWith(
    '/api/tasks/id/proposals',
    expect.objectContaining({
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'SkillSpring' },
    }),
  );
});
test('lets the browser set multipart boundaries and handles empty successful responses', async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal('fetch', fetcher);
  const body = new FormData();
  body.append('notes', 'Done');
  await expect(
    api('/assignments/id/submissions', { method: 'POST', body }),
  ).resolves.toBeUndefined();
  expect(fetcher.mock.calls[0][1].headers).not.toHaveProperty('Content-Type');
});
test('reports connectivity errors without leaking fetch internals', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Internal network details')));
  await expect(api('/tasks')).rejects.toBeInstanceOf(ApiError);
  await expect(api('/tasks')).rejects.toMatchObject({ code: 'network_error', status: 0 });
});
