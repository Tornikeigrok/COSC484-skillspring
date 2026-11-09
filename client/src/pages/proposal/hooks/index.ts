import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-request";
import type { AvailableTask } from "@/pages/tasks/hooks";

interface ProposalBody {
    taskId: string,
    approach: string,
    questions?: string,
    est_hrs: number;
}

export function useSendProposal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: ProposalBody) => await apiRequest('/api/proposals/send-proposal', 'POST', body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-proposals-student'] });
        },
    });
}

// one row of GET /api/proposals/my-proposals (Sequelize names includes after the model)
export interface MyProposal {
    id: number;
    status: 'pending' | 'accepted' | 'rejected';
    proposed_hours: number;
    created_at: string;
    Task: Pick<AvailableTask, 'id' | 'title' | 'task_type' | 'difficulty' | 'Company'>;
}

export function useMyProposals() {
    return useQuery({
        queryKey: ['my-proposals-student'],
        queryFn: () => apiRequest<MyProposal[]>('/api/proposals/my-proposals', 'GET'),
    });
}
