import { apiRequest } from "@/lib/api-request";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { DIFFICULTY_LABELS, TASK_TYPE_LABELS } from "@/constants/tasks";

const baseUrl = import.meta.env.VITE_API_URL ?? '';

// Fetch a zip and hand it to the browser as a file download
async function downloadZip(path: string, filename: string) {
    const res = await fetch(`${baseUrl}${path}`, { credentials: 'include' });
    if (!res.ok) {
        const data = await res.json().catch(() => undefined);
        throw new Error(data?.message || 'Failed to download the file');
    }

    const url = URL.createObjectURL(await res.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

export function useDownload(taskId: number) {
    return useMutation({
        mutationFn: (filename: string) =>
            downloadZip(`/api/proposals/assigned-task/${taskId}/download`, filename),
        onError: (err) => toast.error(err.message),
    });
}

// Company side: download a student's submitted zip
export function useDownloadSubmission() {
    return useMutation({
        mutationFn: ({ id, filename }: { id: number; filename: string }) =>
            downloadZip(`/api/company/submissions/${id}/download`, filename),
        onError: (err) => toast.error(err.message),
    });
}

export interface MyWork {
    id: number;
    status: string;
    proposed_hours: number;
    created_at: string;
    nda_signed: boolean;
    Task: {
        id: number;
        title: string;
        task_type: keyof typeof TASK_TYPE_LABELS;
        difficulty: keyof typeof DIFFICULTY_LABELS;
        deadline: string | null;
        Company: { name: string } | null;
    };
    Submissions: WorkSubmission[];
}

// Submission summary included on my-work and my-proposals rows
export interface WorkSubmission {
    submitted_at: string | null;
    zip_status: string;
}

export function useDisplayMyWork() {
    return useQuery({
        queryKey: ['display-my-work'],
        queryFn: () => apiRequest<MyWork[]>('/api/proposals/my-work', 'GET'),
    });
}

// Latest submission whose zip the server accepted, undefined if the student hasn't submitted yet
export function latestSubmission(work: { Submissions?: WorkSubmission[] } | undefined) {
    return (work?.Submissions ?? [])
        .filter((s): s is WorkSubmission & { submitted_at: string } => s.zip_status === 'accepted' && !!s.submitted_at)
        .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at))[0];
}

interface Submit {
    file: File;
    notes: string;
}

function SubmitTask(body: Submit) {
    const form = new FormData();
    form.append('file', body.file);
    form.append('notes', body.notes);
    return form;
}

export function useSubmitTask(id: string | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: Submit) => apiRequest(`/api/tasks/${id}/submit`, 'POST', SubmitTask(body)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['display-my-work'] });
            queryClient.invalidateQueries({ queryKey: ['my-proposals-student'] });
            queryClient.invalidateQueries({ queryKey: ['assigned-task', Number(id)] });
        },
    });
}

export interface TaskSubmission {
    id: number;
    github_url: string | null;
    notes: string | null;
    submitted_at: string;
    Student: {
        id: number;
        User: { first_name: string; last_name: string; email: string };
    } | null;
    // Scores come back as strings ("1".."4"), the column is TEXT
    Review: {
        id: number;
        status: 'accept' | 'reject' | 'request_changes';
        feedback: string;
        functionality: string;
        quality: string;
        documentation: string;
        communication: string;
        reviewed_at: string;
    } | null;
}

// Shared so the list page and the task page reuse one cache entry per task
const taskSubmissionsQuery = (id: number) => ({
    queryKey: ['task-submissions', id],
    queryFn: () => apiRequest<TaskSubmission[]>(`/api/company/tasks/${id}/submissions`, 'GET'),
});

// One request per task, the server only exposes submissions per task
export function useTaskSubmissions(taskIds: number[]) {
    return useQueries({ queries: taskIds.map(taskSubmissionsQuery) });
}

// Accepted submissions for one of the company's tasks, newest first
export function useSubmissionsForTask(taskId: number, enabled = true) {
    return useQuery({ 
        ...taskSubmissionsQuery(taskId), 
        enabled: enabled && Number.isInteger(taskId) 
    });
}
