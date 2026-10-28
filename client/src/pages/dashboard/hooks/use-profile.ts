import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-request';
import { useAuthenticateUser } from '@/auth/use-authenticate-user';

interface BaseProfile {
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface StudentProfile extends BaseProfile {
  role: 'student';
  Student: {
    university: string | null;
    graduation_year: number | null;
    verification_status: 'unverified' | 'verified';
    bio: string | null;
    github_url: string | null;
    skills: string[],
  };
}

export interface CompanyProfile extends BaseProfile {
  role: 'company';
  Company: {
    name: string;
    website: string | null;
    description: string | null;
    verification_status: 'unverified' | 'verified';
  };
}

export function useFetchProfile(enabled = true) {
  return useQuery<StudentProfile>({
    queryKey: ['student-profile'],
    queryFn: async () => apiRequest<StudentProfile>('/api/student/profile', 'GET'),
    enabled,
  });
}

export function useFetchCompanyProfile(enabled = true) {
  return useQuery<CompanyProfile>({
    queryKey: ['company-profile'],
    queryFn: async () => apiRequest<CompanyProfile>('/api/company/profile', 'GET'),
    enabled,
  });
}

/* Profile of whoever is logged in; only the endpoint matching their role is called */
export function useCurrentUser() {
  const { data: auth } = useAuthenticateUser();
  const student = useFetchProfile(auth?.role === 'student');
  const company = useFetchCompanyProfile(auth?.role === 'company');
  const query = auth?.role === 'company' ? company : student;
  return {
    data: query.data as StudentProfile | CompanyProfile | undefined,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}
