import { atom } from 'recoil';
import type { UserSchema } from '../schemas/userSchema';

interface UsersState {
  users: UserSchema[];
  loading: boolean;
  error: string | null;
  success: string | null;
  initialLoad: boolean;
  page: number;
  totalPages: number;
}

export const DEFAULT_USERS_STATE = {
  users: [],
  loading: false,
  error: null,
  success: null,
  initialLoad: true,
  page: 1,
  totalPages: 1,
};

export const usersState = atom<UsersState>({
  key: 'usersState',
  default: DEFAULT_USERS_STATE,
});
