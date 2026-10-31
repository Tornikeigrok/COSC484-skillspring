import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-request';
import type { Role } from '@/lib/types';

export function useAuthenticateUser() {
  return useQuery({
    queryKey: ['authenticate-user'],
    queryFn: () => apiRequest<{ role: Role }>('/api/auth/authenticate-user', 'GET'),
    retry: false,
  });
}
