import { z } from 'zod';

const VERIFICATION_STATUS = z.enum([
  'pending',
  'verified',
  'failed',
  'declined',
]);

export const employeeSchema = z.object({
  uid: z.string(),
  firstName: z.string(),
  surname: z.string(),
  team: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  companyId: z.string(),
  idNumber: z.string(),
  number: z.string(),
  verificationStatus: VERIFICATION_STATUS,
});

export const employeeArraySchema = z.array(employeeSchema);

export type EmployeeSchema = z.input<typeof employeeSchema>;
