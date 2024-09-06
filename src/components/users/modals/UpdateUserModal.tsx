import { useRecoilState } from 'recoil';
import { Modal } from '../../UI/Modal';
import { Button } from '../../UI/Button';
import { DEFAULT_UPDATE_USER_STATE, updateUserModalState } from './recoil';
import { FormInput } from '../../UI/FormInput';
import type { FormEvent } from 'react';
import { SelectInput } from '../../UI/SelectInput';
import { TIMEOUT_DURATION } from '../../../constants/timeout';
import { updateUser } from '../../../backend/functions';
import { companyState, userState } from '../../../recoil/authState';
import { useAddToast } from '../../../hooks/toastHooks';
import { usersState } from '../../../recoil/usersState';
import { configState } from '../../../recoil/configState';

export const UpdateUserModal = () => {
  const [modalState, setModalState] = useRecoilState(updateUserModalState);
  const [users, setUsers] = useRecoilState(usersState);
  const [user, setUser] = useRecoilState(userState);
  const [company] = useRecoilState(companyState);
  const [config] = useRecoilState(configState);
  const addToast = useAddToast();

  if (!config || !user || !company) return null;

  const { roles } = config;
  const { isOpen, loading, error, firstName, surname, email, role, uid } =
    modalState;

  const roleOptions = roles.map((role) => ({ label: role, value: role }));
  const isFormValid = firstName && surname && email && role;
  const isMe = user.uid === uid;

  const handleClose = () => {
    setModalState(DEFAULT_UPDATE_USER_STATE);
  };

  const handleUpdateField = (field: string, value: string) => {
    setModalState({ ...modalState, [field]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;
    if (loading) return;
    setModalState({ ...modalState, loading: true, error: null });

    try {
      const updatedUser = {
        firstName,
        surname,
        email,
        role,
        uid,
      };

      await updateUser(updatedUser);

      const updatedUsers = users.users.map((user) => {
        if (user.uid === modalState.uid) {
          return {
            ...user,
            ...updatedUser,
          };
        }
        return user;
      });

      setUsers({
        ...users,
        users: updatedUsers,
      });

      if (isMe) {
        setUser({
          ...user,
          firstName: updatedUser.firstName,
          surname: updatedUser.surname,
          email: updatedUser.email,
        });
      }

      addToast('User updated successfully', 'success');

      setModalState({
        ...modalState,
        loading: false,
        success: 'User updated successfully',
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
        error: 'Error updating user',
      });
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Update User">
        <form onSubmit={handleSubmit}>
          <FormInput
            label="First Name"
            type="text"
            required={true}
            id="firstName"
            value={firstName}
            onChange={(value) => handleUpdateField('firstName', value)}
            placeholder="John"
          />
          <FormInput
            label="Surname"
            type="text"
            required={true}
            id="surname"
            value={surname}
            onChange={(value) => handleUpdateField('surname', value)}
            placeholder="Doe"
          />
          <FormInput
            label="Email"
            type="email"
            required={true}
            id="email"
            value={email}
            onChange={(value) => handleUpdateField('email', value)}
            placeholder="example@hollard.com"
          />
          {!isMe && (
            <SelectInput
              options={roleOptions}
              value={role}
              onChange={(value) => handleUpdateField('role', value)}
              label={'Role'}
              required={true}
            />
          )}
          <div className="flex items-center justify-end space-x-2 mt-8">
            {error && <p className="text-error mr-2 text-center">{error}</p>}
            <Button onClick={handleClose} text="Cancel" outline={true} />
            <Button
              type="submit"
              text={modalState.success ? 'User Updated!' : 'Submit'}
              loading={loading}
              disabled={!isFormValid}
            />
          </div>
        </form>
      </Modal>
    </>
  );
};
