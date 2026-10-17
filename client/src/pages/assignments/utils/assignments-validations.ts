import { z } from 'zod';

export const agreementSchema = z.object({
  accepted: z.literal(true, 'you must accept the access terms'),
  accepted_name: z
    .string()
    .min(2, 'enter your full name (at least 2 characters)')
    .max(200, 'name must be at most 200 characters'),
});
export type AgreementFormData = z.infer<typeof agreementSchema>;

export const submissionSchema = z.object({
  file: z.file().min(1, 'choose a solution ZIP file'),
  notes: z.string().max(6000, 'notes must be at most 6,000 characters'),
});
export type SubmissionFormData = z.infer<typeof submissionSchema>;

const feedback = z
  .string()
  .min(10, 'feedback must be at least 10 characters')
  .max(6000, 'feedback must be at most 6,000 characters');

export const reviewSchema = z.discriminatedUnion('decision', [
  z.object({
    decision: z.literal('approved'),
    feedback,
    rating: z.coerce
      .number('choose a rating')
      .int('choose a rating')
      .min(1, 'choose a rating')
      .max(5, 'choose a rating'),
    public_summary: z
      .string()
      .min(10, 'summary must be at least 10 characters')
      .max(2000, 'summary must be at most 2,000 characters'),
  }),
  z.object({ decision: z.enum(['changes_requested', 'rejected']), feedback }),
]);
export type ReviewFormData = z.infer<typeof reviewSchema>;
