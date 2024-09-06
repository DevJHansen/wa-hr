import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState } from 'recoil';
import { auth } from '../../../backend/firebase';
import { companyState, userState } from '../../../recoil/authState';
import { useAuth, useCompany } from '../../../hooks/authHooks';
import { Loading } from '../../UI/Loading';
import { UnAuthorized } from '../UnAuthorized';
import { Sidebar } from '../../UI/Sidebar';
import { LogoutModal } from '../logoutModal/LogoutModal';
import { NotFound } from '../../UI/NotFound';
import { useConfig } from '../../../hooks/configHooks';

export const ProtectedRoute = (
  Component: React.ComponentType,
  roles: string[]
) => {
  const AuthProtectedComponent: React.FC = (props) => {
    const [user, loading, error] = useAuthState(auth);
    const [recoilUserData] = useRecoilState(userState);
    const [company] = useRecoilState(companyState);

    useAuth();
    useCompany();
    useConfig();

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

    if (!company) {
      return (
        <div className="w-screen h-screen flex justify-center items-center">
          <Loading />
        </div>
      );
    }

    // TODO: In this case the "Go Home" button should navigate the user to the landing page
    if (company.deleted) {
      return (
        <div className="w-screen h-screen flex justify-center items-center">
          <NotFound />
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
