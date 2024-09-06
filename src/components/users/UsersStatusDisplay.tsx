import { useRecoilState } from 'recoil';
import { Loading } from '../UI/Loading';
import { MdEdit, MdDelete } from 'react-icons/md';
import { userState } from '../../recoil/authState';
import { deleteUserModalState, updateUserModalState } from './modals/recoil';
import { Pagination } from '../UI/Pagination';
import { UnfavorableFetchResult } from '../UI/UnfavorableFetchResult';
import { usersState } from '../../recoil/usersState';
import { useUsers } from '../../hooks/usersHooks';

export const UsersStatusDisplay = () => {
  const [, setDeleteModalState] = useRecoilState(deleteUserModalState);
  const [, setUpdateModalState] = useRecoilState(updateUserModalState);
  const [users] = useRecoilState(usersState);
  const [user] = useRecoilState(userState);
  const { handleGetUsers } = useUsers();

  if (!user) return null;

  if (users.loading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (users.error && users.users.length < 1) {
    return <UnfavorableFetchResult type="error" message={users.error} />;
  }

  if (users.success && users.users.length === 0) {
    return (
      <UnfavorableFetchResult type="empty" message="No users to display" />
    );
  }

  const handleOpenUpdateModal = (item: {
    uid: string;
    firstName: string;
    surname: string;
    email: string;
    role: string;
  }) => {
    setUpdateModalState({
      isOpen: true,
      uid: item.uid,
      firstName: item.firstName,
      surname: item.surname,
      email: item.email,
      role: item.role,
      loading: false,
      error: null,
      success: null,
    });
  };

  const handleOpenDeleteModal = (item: {
    uid: string;
    firstName: string;
    surname: string;
  }) => {
    setDeleteModalState({
      isOpen: true,
      uid: item.uid,
      fullName: `${item.firstName} ${item.surname}`,
      loading: false,
      error: null,
      success: null,
    });
  };

  return (
    <>
      <div className="overflow-x-auto mt-8">
        <table className="min-w-full">
          <thead className="table-heading-fixed">
            <tr>
              <th className="table-heading">Date Added</th>
              <th className="table-heading">First Name</th>
              <th className="table-heading">Surname</th>
              <th className="table-heading">Email</th>
              <th className="table-heading">Role</th>
              <th className="table-heading">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.users.map((item) => {
              return (
                <tr key={item.uid} className="table-row">
                  <td className="table-div">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="table-div">{item.firstName}</td>
                  <td className="table-div">{item.surname}</td>
                  <td className="table-div">{item.email}</td>
                  <td className="table-div">{item.role}</td>
                  <td className="table-div">
                    <div className="flex">
                      <MdEdit
                        className="clickable-icon mr-2"
                        size={36}
                        onClick={() => handleOpenUpdateModal(item)}
                      />
                      {item.uid !== user.uid && (
                        <MdDelete
                          className="clickable-icon"
                          size={36}
                          onClick={() => handleOpenDeleteModal(item)}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!users.loading && users.users.length && !users.error && (
        <Pagination
          totalPages={users.totalPages}
          currentPage={users.page}
          onPageChange={handleGetUsers}
        />
      )}
    </>
  );
};
