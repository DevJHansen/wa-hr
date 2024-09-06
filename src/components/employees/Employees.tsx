import { MdPersonAdd } from 'react-icons/md';
import { Button } from '../UI/Button';
import { PageHeading } from '../UI/PageHeading';

export const Employees = () => {
  return (
    <div className="sidebar-spacing py-8 h-screen">
      <main className="flex-1 p-6 overflow-auto">
        <PageHeading title={`Employees`} description="Manage your employees." />
      </main>
      <section className="px-4 overflow-auto mt-2">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <Button
              className="button-outline-alternative text-accent"
              outline={true}
              text={''}
              onClick={() => null}
            >
              <MdPersonAdd />
              <span>Create Employee</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
