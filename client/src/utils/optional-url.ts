import { z } from 'zod';

export const optionalUrl = z
  .string()
  .max(300, 'url must be at most 300 characters')
  .refine((value) => value === '' || (/^https?:\/\//i.test(value) && URL.canParse(value)), {
    message: 'enter a valid URL starting with http:// or https://',
  });
