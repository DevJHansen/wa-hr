import { z } from 'zod';

export const companySchema = z.object({
  uid: z.string(),
  name: z.string(),
  industry: z.string(),
  logo: z.string(),
  country: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  deleted: z.boolean(),
  teams: z.array(z.string()),
});

export const usersArraySchema = z.array(companySchema);

export type CompanySchema = z.input<typeof companySchema>;
