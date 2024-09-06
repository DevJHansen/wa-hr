import { useRecoilState } from 'recoil';
import { Modal } from '../../UI/Modal';
import { Button } from '../../UI/Button';
import { DEFAULT_DELETE_USER_STATE, deleteUserModalState } from './recoil';
import { deleteUser } from '../../../backend/functions';
import { TIMEOUT_DURATION } from '../../../constants/timeout';
import { useAddToast } from '../../../hooks/toastHooks';
import { usersState } from '../../../recoil/usersState';

export const DeleteUserModal = () => {
  const [modalState, setModalState] = useRecoilState(deleteUserModalState);
  const [users, setUsers] = useRecoilState(usersState);
  const addToast = useAddToast();

  const { isOpen, loading, error, uid, fullName } = modalState;

  const handleClose = () => {
    setModalState(DEFAULT_DELETE_USER_STATE);
  };

  const handleDelete = async () => {
    if (loading) return;
    setModalState({ ...modalState, loading: true, error: null });

    try {
      await deleteUser(uid);
      setUsers({
        ...users,
        users: users.users.filter((user) => user.uid !== uid),
      });

      addToast('User deleted successfully', 'success');

      setModalState({
        ...modalState,
        loading: false,
        success: 'User deleted successfully',
        error: null,
      });
      setTimeout(() => {
        handleClose();
      }, TIMEOUT_DURATION);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setModalState({ ...modalState, loading: false, error: error.message });
        return;
      }

      setModalState({
        ...modalState,
        loading: false,
        error: 'Error deleting user',
      });
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Delete User">
        <p>Are you sure you want to delete {fullName}?</p>
        <div className="flex items-center justify-end space-x-2 mt-8">
          {error && <p className="text-error text-center mr-2">{error}</p>}
          <Button onClick={handleClose} text="Cancel" outline={true} />
          <Button
            onClick={handleDelete}
            text={modalState.success ? 'User Deleted!' : 'Delete'}
            severity={modalState.success ? 'success' : 'danger'}
            loading={loading}
          />
        </div>
      </Modal>
    </>
  );
};
