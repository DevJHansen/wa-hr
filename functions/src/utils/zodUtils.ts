import { z } from 'zod';

export const emailValue = (fieldName: string) =>
  z.string().refine(
    (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    {
      message: `Invalid email format for ${fieldName}`,
    }
  );
