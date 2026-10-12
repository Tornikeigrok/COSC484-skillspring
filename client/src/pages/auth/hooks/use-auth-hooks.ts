import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-request';

interface registerBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export function useRegister() {
  return useMutation({
    mutationFn: async (body: registerBody) =>
      await apiRequest('/api/auth/student-register', 'POST', body),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => await apiRequest('/api/auth/logout', 'POST'),
  });
}
