import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-request";


export type University = { name: string; domains: string[]; 'state-province': string | null };

export function useUniversityMatches() {
  return useMutation({
    mutationFn: async (uniParam: string) =>
       apiRequest<University[] | undefined>(`/api/student/verification-universities?uni=${encodeURIComponent(uniParam)}`, 'GET')
  })
}
