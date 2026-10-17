import { sampleCompany, sampleUser } from '../../../constants/sample';
import type { ProfileResponse } from '../../../lib/types';

export const sampleProfile: ProfileResponse = {
  user: sampleUser,
  profile: {
    id: 'profile-1',
    user: sampleUser.id,
    bio: 'Computer science student who enjoys building small, well-tested interfaces.',
    university: 'Example University',
    github_url: 'https://github.com/example',
    graduation_year: 2027,
    skills: ['React', 'TypeScript'],
    verification_status: 'unverified',
  },
  experiences: [
    {
      id: 'experience-1',
      title: 'Build a responsive analytics view',
      summary: 'Delivered a responsive charts page with tests.',
      skills: ['React'],
      company: sampleCompany,
      rating: 5,
      completed_at: '2026-01-20T10:00:00.000Z',
    },
  ],
};
