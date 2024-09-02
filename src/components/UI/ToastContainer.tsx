import { useRecoilState } from 'recoil';
import { toastState } from '../../recoil/toastState';
import { ToastNotification } from './ToastNotification';

export const ToastContainer = () => {
  const [toasts, setToasts] = useRecoilState(toastState);

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 space-y-4">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
};
