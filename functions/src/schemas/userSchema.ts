import { z } from 'zod';
import { emailValue } from '../utils/zodUtils';

export const userSchema = z.object({
  uid: z.string(),
  email: emailValue('user email'),
  firstName: z.string(),
  surname: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  companyId: z.string(),
});

export const userSchemaWithRole = z.object({
  uid: z.string(),
  email: emailValue('user email'),
  firstName: z.string(),
  surname: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  companyId: z.string(),
  role: z.string(),
});

export type UserSchema = z.infer<typeof userSchema>;
export type UserSchemaWithRole = z.infer<typeof userSchemaWithRole>;
