import { useRecoilState } from 'recoil';
import { employeesState } from '../recoil/employeeState';
import { getEmployees } from '../backend/functions';

export const useEmployees = () => {
  const [employees, setEmployees] = useRecoilState(employeesState);

  const handleGetEmployees = async (page: number) => {
    if (employees.loading) return;

    try {
      setEmployees((prevSate) => ({
        ...prevSate,
        loading: true,
        initialLoad: false,
      }));

      const allEmployees = await getEmployees(page);

      if (allEmployees === undefined) {
        setEmployees((prevSate) => ({
          ...prevSate,
          loading: false,
          success: null,
          error: 'Error loading employees',
          initialLoad: false,
          page: 1,
          totalPages: 1,
          employees: [],
        }));
        return;
      }

      setEmployees((prevSate) => ({
        ...prevSate,
        employees: allEmployees.employees,
        loading: false,
        success: 'Employees loaded successfully',
        error: null,
        initialLoad: false,
        page: allEmployees.page,
        totalPages: allEmployees.totalPages,
      }));
    } catch (error) {
      setEmployees((prevState) => ({
        ...prevState,
        loading: false,
        success: null,
        error: 'Error loading employees',
        initialLoad: false,
        employees: [],
        page: 1,
        totalPages: 1,
      }));
      console.error('Error loading employees', error);
    }
  };

  return { handleGetEmployees };
};
