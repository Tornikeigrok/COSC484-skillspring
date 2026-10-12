import { z } from 'zod';

export const verificationSchema = z.object({
  evidence: z
    .string()
    .min(20, 'verification information must be at least 20 characters')
    .max(2000, 'verification information must be at most 2,000 characters'),
});
export type VerificationFormData = z.infer<typeof verificationSchema>;
