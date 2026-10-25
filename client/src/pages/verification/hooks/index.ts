import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-request";
import type { VerificationFormData } from "../utils/verification-validations";


export type University = { name: string; domains: string[]; 'state-province': string | null };


export function useUniversityMatches() {
  return useMutation({
    mutationFn: async (uniParam: string) =>
       apiRequest<University[] | undefined>(`/api/student/verification-universities?uni=${encodeURIComponent(uniParam)}`, 'GET')
  })
}

export function useSendVerificationEmail() {
  return useMutation({
    mutationFn: async (body: VerificationFormData) => await apiRequest('/api/student/student-verification', 'POST', body),
  });
}

export function useValidateCode() {
  const queryClient = useQueryClient();
  return useMutation({
     mutationFn: async (body: string) => await apiRequest('/api/student/validate-code', 'POST', { code: body }),
     onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
     }
  });
}
