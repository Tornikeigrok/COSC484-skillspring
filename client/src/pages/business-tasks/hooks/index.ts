import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-request";
import { DIFFICULTY_LABELS, TaskType } from "@/constants/tasks";
import { toast } from "sonner";


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

interface Proposals {
    Student?: {
        id: number;
        User: {
            first_name: string;
            last_name: string;
            email: string;
        };
    };
    id: number;
    task_id: number;
    student_id: number;
    approach: string;
    proposed_hours: number;
    questions: string[];
    status: string;
    nda_signed: boolean;
    created_at: string;
}

export function useGetTaskProposals(taskId?: string, enabled = true) {
    return useQuery({
        queryKey: ['proposals', taskId],
        queryFn: async () => await apiRequest<Proposals[]>(`/api/proposals/company-task-proposals/${taskId}`, 'GET'),
        enabled: !!taskId && enabled,
    });
}

interface NDA {
    email: string;
    taskId: number;
}

export function useSendNda() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: NDA) => await apiRequest('/api/company/send-nda', 'POST', body),
        onSuccess: () => {
            toast.success('Student selected. We’ve emailed them the NDA.');
            queryClient.invalidateQueries({ queryKey: ['proposals'] })
        },
    });
}

