import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-request';


interface registerBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface registerCompany extends registerBody{
  companyName: string,
}

/* Student part */
export function useRegister() {
  return useMutation({
    mutationFn: async (body: registerBody) =>
      await apiRequest('/api/auth/student-register', 'POST', body),
  });
}

/* Company part */
export function useCompanyRegister() {
  return useMutation({
    mutationFn: async (body: registerCompany) =>
      await apiRequest('/api/auth/company-register', 'POST', body),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => await apiRequest('/api/auth/logout', 'POST'),
  });
}
