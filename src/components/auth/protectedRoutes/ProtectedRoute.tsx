import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState } from 'recoil';
import { auth } from '../../../backend/firebase';
import { userState } from '../../../recoil/authState';
import { useAuth, useCompany } from '../../../hooks/authHooks';
import { Loading } from '../../UI/Loading';
import { UnAuthorized } from '../UnAuthorized';
import { Sidebar } from '../../UI/Sidebar';
import { LogoutModal } from '../logoutModal/LogoutModal';

export const ProtectedRoute = (
  Component: React.ComponentType,
  roles: string[]
) => {
  const AuthProtectedComponent: React.FC = (props) => {
    const [user, loading, error] = useAuthState(auth);
    const [recoilUserData] = useRecoilState(userState);

    useAuth();
    useCompany();

    if (loading) {
      return (
        <div className="w-screen h-screen flex justify-center items-center">
          <Loading />
        </div>
      );
    }

    if (error) {
      return <div>{`Error: ${error}`}</div>;
    }

    if (!user) {
      return <Navigate to="/login" />;
    }

    if (!recoilUserData) {
      return (
        <div className="w-screen h-screen flex justify-center items-center">
          <Loading />
        </div>
      );
    }

    if (!roles.includes(recoilUserData.role) && roles.length > 0) {
      return <UnAuthorized />;
    }

    return (
      <div>
        <LogoutModal />
        <Sidebar />
        <Component {...props} />
      </div>
    );
  };

  return AuthProtectedComponent;
};
