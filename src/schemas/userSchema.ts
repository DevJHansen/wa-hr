import { z } from 'zod';
import { emailValue } from '../utils/zodUtils';

export const userSchema = z.object({
  uid: z.string(),
  email: emailValue('user email'),
  firstName: z.string(),
  surname: z.string(),
  role: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  companyId: z.string(),
});

export const usersArraySchema = z.array(userSchema);

export type UserSchema = z.input<typeof userSchema>;
