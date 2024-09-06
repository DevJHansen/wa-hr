import { useRecoilState } from 'recoil';
import { Modal } from '../../UI/Modal';
import { Button } from '../../UI/Button';
import { DEFAULT_CREATE_USER_STATE, createUserModalState } from './recoil';
import { FormInput } from '../../UI/FormInput';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { SelectInput } from '../../UI/SelectInput';
import { createUser } from '../../../backend/functions';
import { TIMEOUT_DURATION } from '../../../constants/timeout';
import { useAddToast } from '../../../hooks/toastHooks';
import { usersState } from '../../../recoil/usersState';
import { configState } from '../../../recoil/configState';
import { companyState } from '../../../recoil/authState';

export const CreateUserModal = () => {
  const [modalState, setModalState] = useRecoilState(createUserModalState);
  const [company] = useRecoilState(companyState);
  const [users, setUsers] = useRecoilState(usersState);
  const [firstName, setFirstName] = useState('');
  const [config] = useRecoilState(configState);
  const [password, setPassword] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const addToast = useAddToast();

  if (!config || !company) return null;

  const { roles } = config;
  const { isOpen, loading, error } = modalState;

  const roleOptions = roles.map((role) => ({ label: role, value: role }));
  const isFormValid =
    firstName && surname && email && role && password.length >= 6;

  const handleClose = () => {
    setModalState(DEFAULT_CREATE_USER_STATE);
    setEmail('');
    setFirstName('');
    setSurname('');
    setRole('');
    setPassword('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;
    if (loading) return;
    setModalState({ ...modalState, loading: true, error: null });

    try {
      const createdUser = await createUser({
        firstName,
        surname,
        email,
        role,
        password,
      });

      // We only want to update the users list if we are on the first page
      if (users.page === 1) {
        const currentUsersList = [...users.users];

        // Only display 10 users per page so remove the last client
        if (currentUsersList.length >= 10) {
          currentUsersList.pop();
        }

        setUsers({
          ...users,
          users: [createdUser, ...currentUsersList],
        });
      }

      addToast('User created successfully', 'success');

      setModalState({
        ...modalState,
        loading: false,
        success: 'User created successfully',
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
        error: 'Error creating user',
      });
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Create User">
        <form onSubmit={handleSubmit}>
          <FormInput
            label="First Name"
            type="text"
            required={true}
            id="firstName"
            value={firstName}
            onChange={(value) => setFirstName(value)}
            placeholder="John"
          />
          <FormInput
            label="Surname"
            type="text"
            required={true}
            id="surname"
            value={surname}
            onChange={(value) => setSurname(value)}
            placeholder="Doe"
          />
          <FormInput
            label="Email"
            type="email"
            required={true}
            id="email"
            value={email}
            onChange={(value) => setEmail(value)}
            placeholder="example@hollard.com"
          />
          <SelectInput
            options={roleOptions}
            value={role}
            onChange={(value) => setRole(value)}
            label={'Role'}
            required={true}
          />
          <FormInput
            label="Password"
            type="password"
            required={true}
            id="password"
            value={password}
            onChange={(value) => setPassword(value)}
            placeholder="********"
            minLength={6}
            showStrength={true}
          />
          <div className="flex items-center justify-end space-x-2 mt-8">
            {error && <p className="text-error text-center mr-2">{error}</p>}
            <Button onClick={handleClose} text="Cancel" outline={true} />
            <Button
              type="submit"
              text={modalState.success ? 'User Created!' : 'Submit'}
              loading={loading}
              disabled={!isFormValid}
            />
          </div>
        </form>
      </Modal>
    </>
  );
};
