import { atom } from 'recoil';
import type { UserSchema } from '../schemas/userSchema';
import { CompanySchema } from '../schemas/companySchema';

export const userState = atom<UserSchema | null>({
  key: 'userState',
  default: null,
});

export const companyState = atom<CompanySchema | null>({
  key: 'companyState',
  default: null,
});
