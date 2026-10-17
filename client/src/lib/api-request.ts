type MethodType = 'POST' | 'GET' | 'DELETE' | 'PATCH' | 'PUT';

export type ApiError = Error & { status?: number; error?: string; code?: string };

const baseUrl = import.meta.env.VITE_API_URL ?? '';

/**
 * @param path - The specific backend endpoint, e.g. '/api/auth/student-login'
 * @param method - HTTP method
 * @param body - optional, as some methods do not send a body
 */
export async function apiRequest<T>(path: string, method: MethodType, body?: unknown): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? null : JSON.stringify(body),
  });

  const data = await res.json().catch(() => undefined);

  if (!res.ok) {
    const err = new Error(
      data?.message || data?.error || `Request failed with status ${res.status}`,
    ) as ApiError;
    err.status = res.status;
    err.error = data?.error;
    err.code = data?.code;
    throw err;
  }

  return data as T;
}
