import { v4 as uuidv4 } from 'uuid';
import { useSetRecoilState } from 'recoil';
import { toastState } from '../recoil/toastState';

export const useAddToast = () => {
  const setToasts = useSetRecoilState(toastState);

  return (message: string, type: 'success' | 'error' | 'info') => {
    const newToast = { id: uuidv4(), message, type };
    setToasts((prevToasts) => [...prevToasts, newToast]);
  };
};
