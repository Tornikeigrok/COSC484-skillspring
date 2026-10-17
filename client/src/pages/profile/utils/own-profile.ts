import type { ProfileResponse } from '../../../lib/types';
import type { StudentProfile } from '../../dashboard/hooks/use-profile';

export function toOwnProfile(me: StudentProfile): ProfileResponse {
  const { Student } = me;
  return {
    user: {
      id: 'me',
      email: me.email,
      first_name: me.first_name,
      last_name: me.last_name,
      role: me.role,
    },
    profile: {
      id: 'me',
      user: 'me',
      bio: Student.bio ?? undefined,
      university: Student.university ?? undefined,
      github_url: Student.github_url ?? undefined,
      graduation_year: Student.graduation_year ?? undefined,
      verification_status: Student.verification_status,
    },
    experiences: [],
  };
}
