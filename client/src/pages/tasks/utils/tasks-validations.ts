import { z } from 'zod';

export const taskSearchSchema = z.object({
  q: z.string().trim().max(100, 'search must be at most 100 characters'),
});
export type TaskSearchFormData = z.infer<typeof taskSearchSchema>;