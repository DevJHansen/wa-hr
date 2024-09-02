import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import type { Firestore } from 'firebase-admin/firestore';
import type { https } from 'firebase-functions/v1';
import type { Response } from 'firebase-functions';
import { z } from 'zod';
import { validateAdmin } from '../utils/authUtils';
import {
  UNAUTHORIZED,
  BAD_REQUEST,
  CREATED,
  INTERNAL_SERVER_ERROR,
  SUCCESS,
  CONFLICT,
} from '../constants/statusCodes';
import { USERS_COLLECTION } from '../constants/firestoreConstants';
import { emailValue } from '../utils/zodUtils';

export const handleCreateUser = async (
  request: https.Request,
  response: Response,
  db: Firestore
) => {
  const isAdmin = await validateAdmin(request);

  if (!isAdmin) {
    response.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
    return;
  }

  const newUserFields = z.object({
    role: z.string(),
    email: emailValue('user email'),
    password: z.string(),
    firstName: z.string(),
    surname: z.string(),
    companyId: z.string(),
  });

  const validatedBody = newUserFields.safeParse(request.body);

  if (!validatedBody.success) {
    functions.logger.error(validatedBody.error);
    response.status(BAD_REQUEST).send({ message: 'Missing required fields' });
    return;
  }

  const { role, email, password, firstName, surname, companyId } =
    validatedBody.data;

  const isUnique = await admin
    .auth()
    .getUserByEmail(email)
    .then(() => false)
    .catch(() => true);

  if (!isUnique) {
    response
      .status(CONFLICT)
      .send({ message: 'User with that email already exists' });
    return;
  }

  try {
    const newAuthUser = await admin.auth().createUser({
      email: email,
      password: password,
      emailVerified: true,
      displayName: firstName + ' ' + surname,
    });

    await admin.auth().setCustomUserClaims(newAuthUser.uid, {
      role,
    });

    const userDocRef = db.collection(USERS_COLLECTION).doc(newAuthUser.uid);

    const userData = {
      firstName,
      surname,
      email: email,
      uid: newAuthUser.uid,
      createdAt: Date.now(),
      updatedAt: 0,
      companyId,
    };

    await userDocRef.set(userData);
    response.status(CREATED).send({
      ...userData,
      role,
    });
  } catch (error) {
    functions.logger.error(error);
    response
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: 'Error creating user' });
  }
};

export const handleUpdateUser = async (
  request: https.Request,
  response: Response,
  db: Firestore
) => {
  // const isAdmin = await validateAdmin(request);

  // if (!isAdmin) {
  //   response.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
  // }

  const updateUserFields = z.object({
    uid: z.string(),
    email: emailValue('user email'),
    firstName: z.string(),
    surname: z.string(),
    role: z.string(),
    companyId: z.string(),
  });

  const validatedBody = updateUserFields.safeParse(request.body);

  if (!validatedBody.success) {
    functions.logger.error(validatedBody.error);
    response.status(BAD_REQUEST).send({ message: 'Missing required fields' });
    return;
  }

  const { uid, role, firstName, surname, email, companyId } =
    validatedBody.data;

  try {
    await Promise.all([
      admin.auth().setCustomUserClaims(uid, {
        role,
      }),
      db.collection(USERS_COLLECTION).doc(uid).update({
        firstName,
        surname,
        email,
        updatedAt: Date.now(),
        companyId,
      }),
      admin.auth().updateUser(uid, {
        email: email,
        displayName: firstName + ' ' + surname,
      }),
    ]);
    response.status(SUCCESS).send({ message: 'User updated successfully' });
  } catch (error) {
    functions.logger.error(error);
    response
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: 'Error updating user' });
  }
};

export const handleDeleteUser = async (
  request: https.Request,
  response: Response,
  db: Firestore
) => {
  const isAdmin = await validateAdmin(request);

  if (!isAdmin) {
    response.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
  }

  const userUID = z.object({
    uid: z.string(),
  });

  const validatedBody = userUID.safeParse(request.body);

  if (!validatedBody.success) {
    functions.logger.error(validatedBody.error);
    response.status(BAD_REQUEST).send({ message: 'Missing required fields' });
    return;
  }

  const { uid } = validatedBody.data;

  try {
    await Promise.all([
      admin.auth().deleteUser(uid),
      db.collection(USERS_COLLECTION).doc(uid).delete(),
    ]);
    response.status(SUCCESS).send({ message: 'User deleted successfully' });
  } catch (error) {
    functions.logger.error(error);
    response
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: 'Error deleting user' });
  }
};
