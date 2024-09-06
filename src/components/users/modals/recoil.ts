import { atom } from 'recoil';

interface CreateUserModalState {
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  success: string | null;
}

interface DeleteUserModalState {
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  success: string | null;
  uid: string;
  fullName: string;
}

interface UpdateUserModalState {
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  success: string | null;
  uid: string;
  firstName: string;
  surname: string;
  email: string;
  role: string;
}

export const DEFAULT_CREATE_USER_STATE: CreateUserModalState = {
  isOpen: false,
  loading: false,
  error: null,
  success: null,
};

export const DEFAULT_DELETE_USER_STATE: DeleteUserModalState = {
  isOpen: false,
  loading: false,
  error: null,
  success: null,
  uid: '',
  fullName: '',
};

export const DEFAULT_UPDATE_USER_STATE: UpdateUserModalState = {
  isOpen: false,
  loading: false,
  error: null,
  success: null,
  uid: '',
  firstName: '',
  surname: '',
  email: '',
  role: '',
};

export const createUserModalState = atom<CreateUserModalState>({
  key: 'createUserModalState',
  default: DEFAULT_CREATE_USER_STATE,
});

export const deleteUserModalState = atom<DeleteUserModalState>({
  key: 'deleteUserModalState',
  default: DEFAULT_DELETE_USER_STATE,
});

export const updateUserModalState = atom<UpdateUserModalState>({
  key: 'updateUserModalState',
  default: DEFAULT_UPDATE_USER_STATE,
});
