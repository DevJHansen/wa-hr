import { PageHeading } from '../UI/PageHeading';
import { BasicInfo } from './BasicInfo';
import { ChangePassword } from './ChangePassword';
import { CompanyInfo } from './CompanyInfo';
import { Danger } from './Danger';

export const Settings = () => {
  return (
    <div className="sidebar-spacing py-8 h-[100vh]">
      <main className="flex-1 p-6 overflow-auto">
        <PageHeading
          title="Settings"
          description="Manage company and personal settings"
        />
        <div className="overflow-scroll max-h-[100%]">
          <section className="mt-8">
            <BasicInfo />
          </section>
          <section className="mt-8">
            <ChangePassword />
          </section>
          <section className="mt-8">
            <CompanyInfo />
          </section>
          <section className="mt-8">
            <Danger />
          </section>
        </div>
      </main>
    </div>
  );
};
