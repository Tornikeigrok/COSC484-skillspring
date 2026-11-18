import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-request";
import type { AvailableTask } from "@/pages/discover/hooks";

export interface AssignedTask {
    task: Pick<AvailableTask, 'id' | 'title' | 'description' | 'difficulty' | 'estimated_hours' | 'deadline' | 'task_type' | 'status'> & {
        Company: { name: string; website: string | null } | null;
        TaskAsset: { original_filename: string; file_type: string; uploaded_at: string } | null;
    };
    proposal: { id: number; status: string; proposed_hours: number };
}

// Only returns data once the student is selected and has signed the NDA (checked on the server)
export function useAssignedTask(taskId: number) {
    return useQuery({
        queryKey: ['assigned-task', taskId],
        queryFn: () => apiRequest<AssignedTask>(`/api/proposals/assigned-task/${taskId}`, 'GET'),
        enabled: Number.isInteger(taskId),
    });
}

interface SignNda {
    firstName: string;
    lastName: string;
}

export function useSignNda(taskId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: SignNda) => apiRequest(`/api/proposals/sign-nda/${taskId}`, 'PATCH', body),
        // Refresh proposals so nda_signed flips and "Start assignment" unlocks
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-proposals-student'] }),
    });
}
