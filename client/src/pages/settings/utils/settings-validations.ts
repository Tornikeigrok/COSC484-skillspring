import { z } from 'zod';
import { optionalUrl } from '../../../utils/optional-url';
import { parseSkills } from '../../../utils/parse-skills';

const nameFields = {
  first_name: z.string().min(1, 'first name is required').max(80, 'first name is too long'),
  last_name: z.string().min(1, 'last name is required').max(80, 'last name is too long'),
};

export const studentProfileSchema = z.object({
  ...nameFields,
  bio: z.string().max(2000, 'bio must be at most 2,000 characters'),
  university: z.string().max(160, 'university must be at most 160 characters'),
  graduation_year: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.coerce
      .number('enter a valid year')
      .int('enter a valid year')
      .min(2000, 'year must be 2000 or later')
      .max(2100, 'year must be 2100 or earlier')
      .optional(),
  ),
  github_url: optionalUrl,
  skills: z.string().max(600, 'skills must be at most 600 characters').transform(parseSkills),
});
export type StudentProfileFormData = z.infer<typeof studentProfileSchema>;

export const companyProfileSchema = z.object({
  ...nameFields,
  name: z
    .string()
    .min(1, 'company name is required')
    .max(160, 'company name must be at most 160 characters'),
  description: z.string().max(2000, 'description must be at most 2,000 characters'),
  website: optionalUrl,
});
export type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'current password is required'),
  password: z
    .string()
    .min(10, 'password must be at least 10 characters')
    .max(72, 'password must be at most 72 characters'),
});
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'password is required'),
  confirmation: z.literal('DELETE', 'type DELETE to confirm'),
});
export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;
