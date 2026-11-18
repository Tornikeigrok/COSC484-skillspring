import { apiRequest } from "@/lib/api-request";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const baseUrl = import.meta.env.VITE_API_URL ?? '';

// Fetch the zip and hand it to the browser as a file download
async function downloadZip(taskId: number, filename: string) {
    const res = await fetch(`${baseUrl}/api/proposals/assigned-task/${taskId}/download`, {
        credentials: 'include',
    });
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
        mutationFn: (filename: string) => downloadZip(taskId, filename),
        onError: (err) => toast.error(err.message),
    });
}

export function useDisplayMyWork() {
    return useQuery({
        queryKey: ['display-my-work'],
        queryFn: () => apiRequest('/api/proposals/my-work', 'GET'),
    });
}
