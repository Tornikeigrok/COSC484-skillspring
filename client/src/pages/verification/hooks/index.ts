import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-request";
import type { VerificationFormData, CompanyVerificationFormData } from "../utils/verification-validations";
import { toast } from "sonner";

export type University = { name: string; domains: string[]; 'state-province': string | null };

/* Student verification part */

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

/* Company verification part */

export function useSendCompanyVerifEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CompanyVerificationFormData) => await apiRequest('/api/company/verification', 'POST', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile'] });
    }
  });
}

export function useValidateCompanyCode() {
  const queryClient = useQueryClient();
  return useMutation({
     mutationFn: async (body: string) => await apiRequest('/api/company/validate-code', 'POST', { code: body }),
     onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile'] });
      toast.success('You have succesfully verified your profile');
     }
  });
}
