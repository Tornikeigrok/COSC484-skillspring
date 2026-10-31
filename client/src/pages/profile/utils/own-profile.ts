import type { ProfileResponse } from '../../../lib/types';
import type { CompanyProfile, StudentProfile } from '../../dashboard/hooks/use-profile';

export function toOwnProfile(me: StudentProfile | CompanyProfile): ProfileResponse {
  return {
    user: {
      id: 'me',
      email: me.email,
      first_name: me.first_name,
      last_name: me.last_name,
      role: me.role,
    },
    profile:
      me.role === 'student'
        ? {
            id: 'me',
            user: 'me',
            bio: me.Student.bio ?? undefined,
            university: me.Student.university ?? undefined,
            github_url: me.Student.github_url ?? undefined,
            graduation_year: me.Student.graduation_year ?? undefined,
            verification_status: me.Student.verification_status,
          }
        : {
            id: 'me',
            user: 'me',
            name: me.Company.name,
            description: me.Company.description ?? '',
            website: me.Company.website ?? '',
            verification_status: me.Company.verification_status,
          },
    experiences: [],
  };
}
