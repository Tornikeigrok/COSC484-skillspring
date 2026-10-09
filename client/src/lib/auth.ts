import { useQuery } from '@tanstack/react-query';
import { api, ApiError } from './api';
import type { User } from './types';
export function useAuth() {
  const query = useQuery({
    queryKey: ['session'],
    queryFn: async ({ signal }) => {
      try {
        return (await api<{ user: User }>('/auth/me', { signal })).user;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 60_000,
    retry: false,
  });
  return { ...query, user: query.data };
}
