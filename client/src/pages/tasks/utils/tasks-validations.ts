import { z } from 'zod';

export const taskFilterSchema = z.object({
  q: z.string().max(100, 'search must be at most 100 characters'),
  category: z.string(),
  difficulty: z.string(),
});
export type TaskFilterFormData = z.infer<typeof taskFilterSchema>;
