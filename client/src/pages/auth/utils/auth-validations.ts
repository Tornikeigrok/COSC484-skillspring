import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'email is required')
    .max(254, 'email must be at most 254 characters')
    .email('enter a valid email'),
  password: z
    .string()
    .min(1, 'password is required')
    .max(72, 'password must be at most 72 characters'),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const registerStudentSchema = loginSchema.extend({
  first_name: z.string().min(1, 'first name is required').max(80, 'first name is too long'),
  last_name: z.string().min(1, 'last name is required').max(80, 'last name is too long'),
  password: z
    .string()
    .min(8, 'password must be at least 8 characters')
    .max(72, 'password must be at most 72 characters'),
});
export type RegisterStudentFormData = z.infer<typeof registerStudentSchema>;

export const registerCompanySchema = registerStudentSchema.extend({
  companyName: z
    .string()
    .min(1, 'company name is required')
    .max(160, 'company name must be at most 160 characters'),
});
export type RegisterCompanyFormData = z.infer<typeof registerCompanySchema>;
