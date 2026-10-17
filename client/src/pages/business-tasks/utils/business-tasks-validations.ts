import { z } from 'zod';
import { DIFFICULTIES } from '../../../constants/tasks';
import { parseSkills } from '../../../utils/parse-skills';

const taskFields = {
  title: z
    .string()
    .min(5, 'title must be at least 5 characters')
    .max(160, 'title must be at most 160 characters'),
  description: z
    .string()
    .min(30, 'description must be at least 30 characters')
    .max(10000, 'description must be at most 10,000 characters'),
  acceptance_criteria: z
    .string()
    .min(10, 'acceptance criteria must be at least 10 characters')
    .max(6000, 'acceptance criteria must be at most 6,000 characters'),
  category: z.string(),
  difficulty: z.enum(DIFFICULTIES),
  estimated_hours: z.coerce
    .number('enter the estimated hours')
    .int('enter a whole number of hours')
    .min(1, 'estimated hours must be at least 1')
    .max(500, 'estimated hours must be at most 500'),
  skills: z.string().max(600, 'skills must be at most 600 characters').transform(parseSkills),
};

export const createTaskSchema = z.discriminatedUnion('agreement_required', [
  z.object({
    ...taskFields,
    agreement_required: z.literal(false),
    agreement_text: z.string().default(''),
  }),
  z.object({
    ...taskFields,
    agreement_required: z.literal(true),
    agreement_text: z
      .string()
      .min(20, 'agreement terms must be at least 20 characters')
      .max(12000, 'agreement terms must be at most 12,000 characters'),
  }),
]);
export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

export const uploadStarterSchema = z.object({
  file: z.file().min(1, 'choose a starter ZIP file'),
});
export type UploadStarterFormData = z.infer<typeof uploadStarterSchema>;
