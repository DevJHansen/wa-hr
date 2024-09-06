import { useRecoilState } from 'recoil';
import { userState } from '../../recoil/authState';
import { InfoCard } from '../UI/InfoCard';
import { PageHeading } from '../UI/PageHeading';

export const Home = () => {
  const [user] = useRecoilState(userState);

  if (!user) return null;

  return (
    <div className="sidebar-spacing py-8 min-h-screen">
      <main className="flex-1 p-6 overflow-auto">
        <PageHeading
          title={`Welcome, ${user.firstName}.`}
          description="Manage your app by choosing one of the options below."
        />
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <InfoCard
            link="employees"
            title="Employees"
            description="Manage employees"
          />
          {user.role === 'admin' && (
            <InfoCard link="users" title="Users" description="Manage users" />
          )}
          <InfoCard
            link="settings"
            title="Settings"
            description="Manage personal and company settings"
          />
        </section>
      </main>
    </div>
  );
};
