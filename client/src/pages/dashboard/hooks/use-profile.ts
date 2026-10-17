import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-request';

export interface StudentProfile {
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'company';
  created_at: string;
  Student: {
    university: string | null;
    graduation_year: number | null;
    verification_status: 'unverified' | 'verified';
    bio: string | null;
    github_url: string | null;
  };
}

export function useFetchProfile() {
  return useQuery<StudentProfile>({
    queryKey: ['student-profile'],
    queryFn: async () => apiRequest<StudentProfile>('/api/student/profile', 'GET'),
  });
}
