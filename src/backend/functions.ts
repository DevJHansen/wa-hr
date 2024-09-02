/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { getNewAuthToken } from './firestoreUtils';
import type { UserSchema } from '../schemas/userSchema';
import { userSchema, usersArraySchema } from '../schemas/userSchema';
import { tokenSchema, type TokenSchema } from '../schemas/tokenSchema';
import {
  apiPaginationSchema,
  type ApiPaginationType,
} from '../schemas/apiResponseSchema';
import type { MessageSchema } from '../schemas/broadcastSchemas';
import {
  broadcastArraySchema,
  messagesArraySchema,
  type BroadcastSchema,
} from '../schemas/broadcastSchemas';

const { VITE_FUNCTIONS_URL = '' } = import.meta.env;

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

type GetBroadcastResponse = ApiPaginationType & {
  broadcasts: BroadcastSchema[];
};

type GetMessagesResponse = ApiPaginationType & {
  messages: MessageSchema[];
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

export const getAccessToken = async (): Promise<TokenSchema> => {
  try {
    const userToken = await getNewAuthToken();
    const result = await axios.post(
      `https://getaccesstoken${VITE_FUNCTIONS_URL}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    const tokenData = {
      ...result.data,
      accessTokenExpiresAt: new Date(result.data.accessTokenExpiresAt),
    };

    const validatedResponse = tokenSchema.safeParse(tokenData);

    if (!validatedResponse.success) {
      console.error(
        'Error validating token response',
        validatedResponse.error.issues
      );
      throw new Error('Error validating access token');
    }

    return validatedResponse.data;
  } catch (error) {
    console.error(error);
    throw new Error('Error getting access token');
  }
};

export const getBroadcasts = async (
  page: number
): Promise<GetBroadcastResponse | undefined> => {
  try {
    const userToken = await getNewAuthToken();
    const { data } = await axios.post(
      `https://getbroadcasts${VITE_FUNCTIONS_URL}?page=${page}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    const combinedSchema = apiPaginationSchema.extend({
      broadcasts: broadcastArraySchema,
    });

    const validatedData = combinedSchema.safeParse(data);

    if (!validatedData.success) {
      console.error('Error getting broadcasts', validatedData.error);
      return undefined;
    }

    return validatedData.data;
  } catch (error: any) {
    console.error(error);
    return undefined;
  }
};

export const getMessages = async (
  page: number,
  broadcastId: string
): Promise<GetMessagesResponse | undefined> => {
  try {
    const userToken = await getNewAuthToken();
    const { data } = await axios.post(
      `https://getmessages${VITE_FUNCTIONS_URL}?page=${page}&broadcastId=${broadcastId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    const combinedSchema = apiPaginationSchema.extend({
      messages: messagesArraySchema,
    });

    const validatedData = combinedSchema.safeParse(data);

    if (!validatedData.success) {
      console.error('Error getting messages', validatedData.error);
      return undefined;
    }

    return validatedData.data;
  } catch (error: any) {
    console.error(error);
    return undefined;
  }
};

export const retryAllFailedMessages = async (broadcastId: string) => {
  try {
    const userToken = await getNewAuthToken();
    await axios.post(
      `https://retryfailedmessages${VITE_FUNCTIONS_URL}`,
      {
        broadcastId,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
  } catch (error: any) {
    console.error(error);
  }
};
