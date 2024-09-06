import { atom } from 'recoil';
import { EmployeeSchema } from '../schemas/employeeSchema';

interface EmployeesState {
  employees: EmployeeSchema[];
  loading: boolean;
  error: string | null;
  success: string | null;
  initialLoad: boolean;
  page: number;
  totalPages: number;
}

export const DEFAULT_EMPLOYEES_STATE = {
  employees: [],
  loading: false,
  error: null,
  success: null,
  initialLoad: true,
  page: 1,
  totalPages: 1,
};

export const employeesState = atom<EmployeesState>({
  key: 'employeesState',
  default: DEFAULT_EMPLOYEES_STATE,
});
