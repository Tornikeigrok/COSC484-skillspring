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
    Submissions?: { id: number; Review: ProposalReview['Review'] | null }[];
} | null;

export function useViewStudent(id: string | undefined) {
    return useQuery({
        queryKey: ['student-profile', id],
        queryFn: () => apiRequest<ViewedStudent>(`/api/company/student-profile/${id}`, 'GET'),
        enabled: !!id,
    });
}

export interface ProposalReview {
  id: number;
  submitted_at: string;
  Proposal: {
    id: number;
    Task: {
      id: number;
      title: string;
      difficulty: string;
      task_type: string;
      Company: {
        name: string;
      };
    };
  };
  Review: {
    communication: string;
    documentation: string;
    functionality: string;
    quality: string;
    feedback?: string;
    reviewed_at: string;
    status: string;
    Company?: { name: string; website: string | null };
  };
}

// Company view of a student returns submissions without task details.
export type ReviewedItem = Pick<ProposalReview, 'id' | 'Review'> &
  Partial<Pick<ProposalReview, 'submitted_at' | 'Proposal'>>;

export function useViewedTasks(enabled = false) {
    return useQuery({
        queryKey: ['display-all-reviewd-tasks'],
        queryFn: () => apiRequest<ProposalReview[]>(`/api/student/reviewed-tasks`, 'GET'),
        enabled,
    });
}
