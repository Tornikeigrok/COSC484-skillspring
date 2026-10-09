import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
export function useApiQuery<T>(key: readonly unknown[], path: string, enabled = true) {
  return useQuery({
    queryKey: key,
    queryFn: ({ signal }) => api<T>(path, { signal }),
    enabled,
    retry: false,
  });
}
export function useAction<T = unknown, V = unknown>(
  path: string | ((input: V) => string),
  method = 'POST',
) {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: V) =>
      api<T>(typeof path === 'function' ? path(input) : path, { method, body: input }),
    onSuccess: async () => {
      await cache.invalidateQueries();
    },
  });
}
