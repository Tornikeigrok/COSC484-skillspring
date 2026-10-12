import { z } from 'zod';

export const proposalSchema = z.object({
  message: z
    .string()
    .min(30, 'your approach must be at least 30 characters')
    .max(6000, 'your approach must be at most 6,000 characters'),
  estimated_hours: z.coerce
    .number('enter the estimated hours')
    .int('enter a whole number of hours')
    .min(1, 'estimated hours must be at least 1')
    .max(500, 'estimated hours must be at most 500'),
});
export type ProposalFormData = z.infer<typeof proposalSchema>;
