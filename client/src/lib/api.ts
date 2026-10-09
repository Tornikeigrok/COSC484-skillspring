export const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
export class ApiError extends Error {
  status: number;
  code: string;
  details: { path: string; message: string }[];
  constructor(
    status: number,
    error: { message?: string; code?: string; details?: { path: string; message: string }[] },
  ) {
    super(error.message || 'Something went wrong. Please try again.');
    this.status = status;
    this.code = error.code || 'request_failed';
    this.details = error.details || [];
  }
}
export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const isForm = options.body instanceof FormData;
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method || 'GET',
      credentials: 'include',
      signal: options.signal,
      headers: {
        'X-Requested-With': 'SkillSpring',
        ...(!isForm && options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body:
        options.body === undefined
          ? undefined
          : isForm
            ? (options.body as FormData)
            : JSON.stringify(options.body),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new ApiError(0, {
      code: 'network_error',
      message: 'Cannot reach SkillSpring. Check your connection and try again.',
    });
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status, data.error || {});
  return data as T;
}
export const fileUrl = (id: string) => `${API_URL}/files/${encodeURIComponent(id)}/download`;
