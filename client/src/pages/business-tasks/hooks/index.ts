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
function toTaskForm(body: Task) {
    const form = new FormData();
    form.append('taskTitle', body.taskTitle);
    form.append('taskDesc', body.taskDesc);
    form.append('taskType', body.taskType);
    form.append('difficulty', body.difficulty);
    form.append('estimated_hours', String(body.estimated_hours));
    form.append('file', body.file);
    return form;
}

export function usePostTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: Task) => apiRequest('/api/company/post-task', 'POST', toTaskForm(body)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['company-tasks'] });
        },
    });
}

/**
 * Sends a rejected task back to review with a new zip. The task keeps its id,
 * so nothing new is created and its proposals/links stay valid.
 */
export function useReviseTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...body }: Task & { id: number }) =>
            apiRequest(`/api/company/revise-task/${id}`, 'POST', toTaskForm(body)),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['company-tasks'] });
            queryClient.invalidateQueries({ queryKey: ['/api/company/task-assets', String(id)] });
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
    rejected_reason: string[];
}

export function useFetchAllTasks() {
    return useQuery({
        queryKey: ['company-tasks'],
        queryFn: () => apiRequest<CompanyTask[]>('/api/company/tasks', 'GET'),
    })
}

export interface TaskAsset {
    status: string;
    TaskAsset: {
        original_filename: string;
        task_id: number;
        file_type: string;
        uploaded_at: string;
    };
}

export function useTaskDetails(id: string | undefined) {
    return useQuery({
        queryKey: ['/api/company/task-assets', id],
        queryFn: () =>
            apiRequest<{ task_assets: TaskAsset | null }>(`/api/company/task-assets/${id}`, 'GET'),
        enabled: !!id,
    })
}
