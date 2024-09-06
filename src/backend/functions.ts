/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { getNewAuthToken } from './firestoreUtils';
import type { UserSchema } from '../schemas/userSchema';
import { userSchema, usersArraySchema } from '../schemas/userSchema';
import { z } from 'zod';
import { employeeArraySchema, EmployeeSchema } from '../schemas/employeeSchema';

const { VITE_FUNCTIONS_URL = '' } = import.meta.env;

export const apiPaginationSchema = z.object({
  page: z.number(),
  totalPages: z.number(),
});

export type ApiPaginationType = z.infer<typeof apiPaginationSchema>;

interface NewUser {
  email: string;
  password: string;
  firstName: string;
  surname: string;
  role: string;
}

interface UpdateUser {
  email: string;
  firstName: string;
  surname: string;
  role: string;
  uid: string;
}

type GetUsersResponse = ApiPaginationType & {
  users: UserSchema[];
};

type GetEmployeesResponse = ApiPaginationType & {
  employees: EmployeeSchema[];
};

export const getUsers = async (
  page: number
): Promise<GetUsersResponse | undefined> => {
  try {
    const userToken = await getNewAuthToken();
    const { data } = await axios.post(
      `https://getusers${VITE_FUNCTIONS_URL}?page=${page}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    const combinedSchema = apiPaginationSchema.extend({
      users: usersArraySchema,
    });

    const validatedData = combinedSchema.safeParse(data);

    if (!validatedData.success) {
      console.error('Error getting users', validatedData.error);
      return undefined;
    }

    return validatedData.data;
  } catch (error: any) {
    console.error(error);
    return undefined;
  }
};

export const createUser = async (newUser: NewUser): Promise<UserSchema> => {
  try {
    const userToken = await getNewAuthToken();
    const result = await axios.post(
      `https://createuser${VITE_FUNCTIONS_URL}`,
      newUser,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    const validatedResponse = userSchema.safeParse(result.data);

    if (!validatedResponse.success) {
      console.error('Error validating user response', validatedResponse.error);
      throw new Error('Error creating user');
    }
    return validatedResponse.data;
  } catch (error) {
    console.error(error);
    throw new Error('Error creating user');
  }
};

export const updateUser = async (updatedUser: UpdateUser): Promise<boolean> => {
  try {
    const userToken = await getNewAuthToken();
    await axios.post(
      `https://updateuser${VITE_FUNCTIONS_URL}`,
      {
        ...updatedUser,
        updatedAt: +new Date(),
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    return true;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating user');
  }
};

export const deleteUser = async (uid: string): Promise<boolean> => {
  try {
    const userToken = await getNewAuthToken();
    await axios.post(
      `https://deleteuser${VITE_FUNCTIONS_URL}`,
      {
        uid,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    return true;
  } catch (error) {
    console.error(error);
    throw new Error('Error deleting user');
  }
};

export const removeTeamFromEmployees = async (
  team: string
): Promise<boolean> => {
  try {
    const userToken = await getNewAuthToken();
    await axios.post(
      `https://removeemployeeteam${VITE_FUNCTIONS_URL}`,
      {
        team,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    return true;
  } catch (error) {
    console.error(error);
    throw new Error('Error deleting user');
  }
};

export const getEmployees = async (
  page: number
): Promise<GetEmployeesResponse | undefined> => {
  try {
    const userToken = await getNewAuthToken();
    const { data } = await axios.post(
      `https://getemployees${VITE_FUNCTIONS_URL}?page=${page}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    const combinedSchema = apiPaginationSchema.extend({
      employees: employeeArraySchema,
    });

    const validatedData = combinedSchema.safeParse(data);

    if (!validatedData.success) {
      console.error('Error getting employees', validatedData.error);
      return undefined;
    }

    return validatedData.data;
  } catch (error: any) {
    console.error(error);
    return undefined;
  }
};
