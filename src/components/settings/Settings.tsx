import { useRecoilState } from 'recoil';
import { userState } from '../../recoil/authState';
import { PageHeading } from '../UI/PageHeading';
import { BasicInfo } from './BasicInfo';
import { ChangePassword } from './ChangePassword';
import { CompanyInfo } from './CompanyInfo';
import { Teams } from './Teams';
import { DeleteCompanyModal } from './modals/DeleteCompany';
import { DeleteTeamModal } from './modals/DeleteTeam';

export const Settings = () => {
  const [user] = useRecoilState(userState);

  if (!user) return;

  return (
    <div className="sidebar-spacing py-8 h-[100vh]">
      <DeleteTeamModal />
      <DeleteCompanyModal />
      <main className="flex-1 p-6 overflow-auto">
        <PageHeading
          title="Settings"
          description="Manage company and personal settings"
        />
        <div className="overflow-scroll max-h-[100%]">
          {user.role === 'admin' && (
            <section className="mt-8">
              <CompanyInfo />
            </section>
          )}
          {user.role === 'admin' && (
            <section className="mt-8">
              <Teams />
            </section>
          )}
          <section className="mt-8">
            <BasicInfo />
          </section>
          <section className="mt-8">
            <ChangePassword />
          </section>
        </div>
      </main>
    </div>
  );
};
