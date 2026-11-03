import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-request";
import { DIFFICULTY_LABELS, DIFFICULTIES, TaskType } from "@/constants/tasks";


export interface Task {
    taskTitle: string;
    taskDesc: string;
    taskType: TaskType;
    difficulty: keyof typeof DIFFICULTY_LABELS;
    estimated_hours: number;
    file: File;
}

/**
 * req can only ever have one shape, thus we wrap everything in formData 
 */
export function usePostTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: Task) => {
            const form = new FormData();
            form.append('taskTitle', body.taskTitle);
            form.append('taskDesc', body.taskDesc);
            form.append('taskType', body.taskType);
            form.append('difficulty', body.difficulty);
            form.append('estimated_hours', String(body.estimated_hours));
            form.append('file', body.file);
            return apiRequest('/api/company/post-task', 'POST', form);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['company-tasks'] });
        },
    });
}

export interface CompanyTask {
    id: number;
    title: string;
    description: string;
    difficulty: keyof typeof DIFFICULTY_LABELS;
    estimated_hours: number | null;
    status: string;
    task_type: TaskType;
    created_at: string;
    // pending proposals on this task; server to provide
    proposal_count?: number;
}

export function useFetchAllTasks() {
    return useQuery({
        queryKey: ['company-tasks'],
        queryFn: () => apiRequest<CompanyTask[]>('/api/company/tasks', 'GET'),
    })
}
