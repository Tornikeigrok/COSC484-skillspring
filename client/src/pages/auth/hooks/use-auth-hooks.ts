import { useMutation, useQueryClient } from '@tanstack/react-query';
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


interface loginBody {
  email: string;
  password: string;
}

// The session cookie changed, so drop any cached "signed out" 
// result before the protected routes check it again
function useResetSession() {
  const queryClient = useQueryClient();
  return () => queryClient.resetQueries({ queryKey: ['authenticate-user'] });
}

/* Student Part */
export function useStudentLogin() {
  const resetSession = useResetSession();
  return useMutation({
    mutationFn: async (body: loginBody) =>
      await apiRequest('/api/auth/student-login', 'POST', body),
    onSuccess: resetSession,
  });
}

/* Company Part */
export function useCompanyLogin() {
  const resetSession = useResetSession();
  return useMutation({
    mutationFn: async (body: loginBody) =>
      await apiRequest('/api/auth/company-login', 'POST', body),
    onSuccess: resetSession,
  });
}

/* Student part */
export function useStudentRegister() {
  const resetSession = useResetSession();
  return useMutation({
    mutationFn: async (body: registerBody) =>
      await apiRequest('/api/auth/student-register', 'POST', body),
    onSuccess: resetSession,
  });
}

/* Company part */
export function useCompanyRegister() {
  const resetSession = useResetSession();
  return useMutation({
    mutationFn: async (body: registerCompany) =>
      await apiRequest('/api/auth/company-register', 'POST', body),
    onSuccess: resetSession,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => await apiRequest('/api/auth/logout', 'POST'),
  });
}
