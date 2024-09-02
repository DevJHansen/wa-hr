import { MdHome, MdLogout, MdGroup, MdSettings } from 'react-icons/md';
import { Tooltip } from './Tooltip';
import { Link } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { logoutModal } from '../auth/logoutModal/recoil';
import { userState } from '../../recoil/authState';

export const Sidebar = () => {
  const [, setIsOpen] = useRecoilState(logoutModal);
  const [user] = useRecoilState(userState);

  if (!user) return null;

  return (
    <div className="h-screen fixed flex flex-col justify-between items-center p-4 bg-primary shadow-primary shadow-xl">
      <div className="flex flex-col items-center">
        <Tooltip content="Home" position="right">
          <Link to="/">
            <MdHome size={22} className="mb-8 text-white cursor-pointer" />
          </Link>
        </Tooltip>
        <Tooltip content="Employees" position="right">
          <Link to="/employees">
            <MdGroup size={22} className="mb-8 text-white cursor-pointer" />
          </Link>
        </Tooltip>
        <Tooltip content="Settings" position="right">
          <Link to="/settings">
            <MdSettings size={22} className="mb-8 text-white cursor-pointer" />
          </Link>
        </Tooltip>
      </div>
      <div className="logout">
        <Tooltip content="Logout" position="right">
          <MdLogout
            size={22}
            className="cursor-pointer"
            onClick={() => setIsOpen(true)}
          />
        </Tooltip>
      </div>
    </div>
  );
};
