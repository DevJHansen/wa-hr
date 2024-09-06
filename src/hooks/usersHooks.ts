import { useRecoilState } from 'recoil';
import { usersState } from '../recoil/usersState';
import { getUsers } from '../backend/functions';

export const useUsers = () => {
  const [users, setUsers] = useRecoilState(usersState);

  const handleGetUsers = async (page: number) => {
    if (users.loading) return;

    try {
      setUsers((prevSate) => ({
        ...prevSate,
        loading: true,
        initialLoad: false,
      }));

      const allUsers = await getUsers(page);

      if (allUsers === undefined) {
        setUsers((prevSate) => ({
          ...prevSate,
          loading: false,
          success: null,
          error: 'Error loading users',
          initialLoad: false,
          page: 1,
          totalPages: 1,
          users: [],
        }));
        return;
      }

      setUsers((prevSate) => ({
        ...prevSate,
        users: allUsers.users,
        loading: false,
        success: 'Users loaded successfully',
        error: null,
        initialLoad: false,
        page: allUsers.page,
        totalPages: allUsers.totalPages,
      }));
    } catch (error) {
      setUsers((prevState) => ({
        ...prevState,
        loading: false,
        success: null,
        error: 'Error loading users',
        initialLoad: false,
        users: [],
        page: 1,
        totalPages: 1,
      }));
      console.error('Error loading users', error);
    }
  };

  return { handleGetUsers };
};
