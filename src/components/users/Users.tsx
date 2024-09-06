import { MdPersonAdd } from 'react-icons/md';
import { PageHeading } from '../UI/PageHeading';
import { UsersStatusDisplay } from './UsersStatusDisplay';
import { CreateUserModal } from './modals/CreateUserModal';
import { createUserModalState } from './modals/recoil';
import { useRecoilState } from 'recoil';
import { Button } from '../UI/Button';
import { DeleteUserModal } from './modals/DeleteUserModal';
import { UpdateUserModal } from './modals/UpdateUserModal';
import { useEffect, useRef } from 'react';
import { usersState } from '../../recoil/usersState';
import { useUsers } from '../../hooks/usersHooks';

export const Users = () => {
  const [modalState, setModalState] = useRecoilState(createUserModalState);
  const [users] = useRecoilState(usersState);
  const { handleGetUsers } = useUsers();

  const hasFetchedUsers = useRef(false);

  useEffect(() => {
    if (!hasFetchedUsers.current && !users.users.length) {
      handleGetUsers(1);
      hasFetchedUsers.current = true;
    }
  }, [handleGetUsers, users.users.length]);

  return (
    <>
      <CreateUserModal />
      <DeleteUserModal />
      <UpdateUserModal />
      <div className="sidebar-spacing py-8 h-screen">
        <main className="flex-1 p-6 overflow-auto">
          <PageHeading title={`Users`} description="Manage your users." />
        </main>
        <section className="px-4 overflow-auto mt-2">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <Button
                className="button-outline-alternative text-accent"
                outline={true}
                text={''}
                onClick={() =>
                  setModalState({
                    ...modalState,
                    isOpen: true,
                  })
                }
              >
                <MdPersonAdd />
                <span>Create User</span>
              </Button>
            </div>
          </div>
          <UsersStatusDisplay />
        </section>
      </div>
    </>
  );
};
