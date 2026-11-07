import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-request";
import type { Company, TaskStatus } from "@/lib/types";
import type { DIFFICULTIES, TaskType } from "@/constants/tasks";

// one row of GET /api/tasks (students only get open tasks)
export interface AvailableTask {
    id: number;
    title: string;
    description: string;
    difficulty: (typeof DIFFICULTIES)[number];
    estimated_hours: number | null;
    status: TaskStatus;
    task_type: TaskType;
    created_at: string;
    // Sequelize names the include after the model, hence the capital C
    Company: Pick<Company, 'name' | 'website' | 'verification_status'>;
}

export function useGetAllTasks() {
    return useQuery({
        queryKey: ['student-available-tasks'],
        queryFn: () => apiRequest<AvailableTask[]>('/api/tasks/', 'GET'),
    });
}


/* Get details about a specific task */
export function useGetTaskDetails(id: string | undefined) {
    return useQuery({
        queryKey: ['student-available-task-details', id],
        queryFn: () => apiRequest<AvailableTask>(`/api/tasks/${id}`, 'GET'),
        enabled: !!id,
    });
}
