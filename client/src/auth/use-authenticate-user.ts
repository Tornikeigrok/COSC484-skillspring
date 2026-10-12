import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-request';

export function useAuthenticateUser() {
  return useQuery({
    queryKey: ['authenticate-user'],
    queryFn: () => apiRequest('/api/auth/authenticate-user', 'GET'),
    retry: false,
  });
}
