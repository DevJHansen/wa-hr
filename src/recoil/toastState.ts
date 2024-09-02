import { atom } from 'recoil';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const toastState = atom<Toast[]>({
  key: 'toastState',
  default: [],
});
