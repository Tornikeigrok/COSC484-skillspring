import { useEffect, useState } from 'react';
import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const verificationSchema = z.object({
  full_name: z.string().trim().min(2, 'full name is required').max(120),
  university: z.string().trim().min(3, 'university is required, min 3 characters').max(160),
  graduation_year: z.coerce
    .number({ message: 'graduation year is required' })
    .int()
    .min(currentYear, `graduation year must be ${currentYear} or later`)
    .max(currentYear + 6, `graduation year must be ${currentYear + 6} or earlier`),
  university_email: z.email('enter a valid university email'),
  bio: z.string().trim().max(1000, 'bio must be at most 1,000 characters'),
});
export type VerificationFormData = z.infer<typeof verificationSchema>;

// Debouncer for university field (verification)
export function useDebounce(value: string, delay = 300) {
  const [debounce, setDebounce] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounce(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    }
  }, [value, delay]);

  return debounce;
}