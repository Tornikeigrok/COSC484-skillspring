import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-request";

export type ViewedStudent = {
    user_id: number;
    bio?: string | null;
    github_url?: string | null;
    university?: string | null;
    graduation_year?: number | null;
    verification_status: 'unverified' | 'pending' | 'verified';
    skills?: string[] | null;
    User: { first_name: string; last_name: string; role: 'student' };
} | null;

export function useViewStudent(id: string | undefined) {
    return useQuery({
        queryKey: ['student-profile', id],
        queryFn: () => apiRequest<ViewedStudent>(`/api/company/student-profile/${id}`, 'GET'),
        enabled: !!id,
    });
}
