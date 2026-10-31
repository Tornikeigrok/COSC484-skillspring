import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-request";
import { toast } from "sonner";

interface profileBody {
    bio: string,
    githubUrl: string,
    skills: string[],
} 

interface companyProfile {
    first_name: string;
    last_name: string;
    description: string;
}

interface updatePasswordBody {
    currentPassword: string,
    newPassword: string,
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: profileBody) => apiRequest('/api/student/update-profile', 'PATCH', body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-profile'] });
            toast.success('profile updated!');
        }
    });
}

export function useUpdatePassword() {
    return useMutation({
        mutationFn: async (data: updatePasswordBody) => apiRequest('/api/student/update-password', 'PATCH', data),
        onSuccess: () => {
            toast.success('password updated!');
        },
    });
}


export function useUpdateCompanyPassword() {
    return useMutation({
        mutationFn: async (data: updatePasswordBody) => apiRequest('/api/company/update-password', 'PATCH', data),
        onSuccess: () => {
            toast.success('password updated!');
        },
    });
}

export function useUpdateCompanyProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: companyProfile) => apiRequest('/api/company/update-profile', 'PATCH', body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['company-profile'] });
            toast.success('profile updated!');
        }
    });
}
