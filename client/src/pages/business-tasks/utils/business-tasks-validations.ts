import { z } from 'zod';
import { DIFFICULTIES, TASK_TYPES } from '../../../constants/tasks';


const taskFields = {
  title: z
    .string()
    .min(5, 'title must be at least 5 characters')
    .max(160, 'title must be at most 160 characters'),
  description: z
    .string()
    .min(30, 'description must be at least 30 characters')
    .max(10000, 'description must be at most 10,000 characters'),
  task_type: z.enum(TASK_TYPES),
  difficulty: z.enum(DIFFICULTIES),
  estimated_hours: z.coerce
    .number('enter the estimated hours')
    .int('enter a whole number of hours')
    .min(1, 'estimated hours must be at least 1')
    .max(500, 'estimated hours must be at most 500'),
  files: z.file('please upload a zip file'),
};

export const createTaskSchema = z.object(taskFields);
export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

export const uploadStarterSchema = z.object({
  file: z.file().min(1, 'choose a starter ZIP file'),
});
export type UploadStarterFormData = z.infer<typeof uploadStarterSchema>;
