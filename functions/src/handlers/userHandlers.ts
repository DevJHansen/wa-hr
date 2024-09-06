import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import type { Firestore } from 'firebase-admin/firestore';
import type { https } from 'firebase-functions/v1';
import type { Response } from 'firebase-functions';
import { z } from 'zod';
import { getUser, getUserDoc, validateAdmin } from '../utils/authUtils';
import {
  UNAUTHORIZED,
  BAD_REQUEST,
  CREATED,
  INTERNAL_SERVER_ERROR,
  SUCCESS,
  CONFLICT,
  NOT_FOUND,
} from '../constants/statusCodes';
import { USERS_COLLECTION } from '../constants/firestoreConstants';
import { emailValue } from '../utils/zodUtils';
import { DEFAULT_PAGE_SIZE } from '../constants/pagination';
import { UserSchema, userSchemaWithRole } from '../schemas/userSchema';
import { getTotalPages } from '../utils/pagination';

export const handleGetUsers = async (
  request: https.Request,
  response: Response
) => {
  const [isAdmin, submittingUser] = await Promise.all([
    validateAdmin(request),
    getUser(request),
  ]);

  if (!submittingUser || !isAdmin) {
    response.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
    return;
  }

  const submittingUserDoc = await getUserDoc(submittingUser?.uid ?? '');

  if (!submittingUserDoc) {
    response.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
    return;
  }

  const page = parseInt(request.query.page as string) || 1;

  try {
    const collectionRef = admin.firestore().collection(USERS_COLLECTION);

    const fireStoreUsers = await collectionRef
      .where('companyId', '==', submittingUserDoc.companyId)
      .orderBy('createdAt', 'desc')
      .limit(DEFAULT_PAGE_SIZE)
      .offset((page - 1) * DEFAULT_PAGE_SIZE)
      .get();

    const firebaseAuthUsers = await admin
      .auth()
      .getUsers(fireStoreUsers.docs.map((doc) => ({ uid: doc.id })));

    const users = firebaseAuthUsers.users.map((user) => {
      const firestoreUser = fireStoreUsers.docs.find(
        (doc) => doc.id === user.uid
      );

      if (!firestoreUser?.exists) {
        return undefined;
      }

      const validatedUser = userSchemaWithRole.safeParse({
        uid: user.uid,
        email: user.email,
        firstName: firestoreUser.data().firstName,
        surname: firestoreUser.data().surname,
        role: user.customClaims?.role,
        createdAt: firestoreUser.data().createdAt,
        updatedAt: firestoreUser.data().updatedAt,
        companyId: firestoreUser.data().companyId,
      });

      if (validatedUser.success) {
        return validatedUser.data;
      }

      return undefined;
    });

    const filteredUsers = users.filter((user) => user !== undefined);
    const validateFilter = z.array(userSchemaWithRole).safeParse(filteredUsers);

    if (!validateFilter.success) {
      return response
        .status(BAD_REQUEST)
        .send({ message: 'Error getting users' });
    }

    const orderedUsers = validateFilter.data.sort(
      (a, b) => b.createdAt - a.createdAt
    );

    const countSnapshot = await collectionRef.count().get();

    const totalPages = getTotalPages(
      countSnapshot.data().count,
      DEFAULT_PAGE_SIZE
    );

    return response.status(SUCCESS).send({
      users: orderedUsers,
      page,
      totalPages,
    });
  } catch (error) {
    functions.logger.error(error);
    return response
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: 'Error getting user' });
  }
};

export const handleCreateUser = async (
  request: https.Request,
  response: Response,
  db: Firestore
) => {
  const [isAdmin, submittingUser] = await Promise.all([
    validateAdmin(request),
    getUser(request),
  ]);

  if (!isAdmin || !submittingUser) {
    response.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
    return;
  }

  const submittingUserDoc = await getUserDoc(submittingUser?.uid ?? '');

  if (!submittingUserDoc) {
    response.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
    return;
  }

  const newUserFields = z.object({
    role: z.string(),
    email: emailValue('user email'),
    password: z.string(),
    firstName: z.string(),
    surname: z.string(),
  });

  const validatedBody = newUserFields.safeParse(request.body);

  if (!validatedBody.success) {
    functions.logger.error(validatedBody.error);
    response.status(BAD_REQUEST).send({ message: 'Missing required fields' });
    return;
  }

  const { role, email, password, firstName, surname } = validatedBody.data;

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
      companyId: submittingUserDoc.companyId,
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
  const [isAdmin, submittingUser] = await Promise.all([
    validateAdmin(request),
    getUser(request),
  ]);

  if (!isAdmin || !submittingUser) {
    response.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
    return;
  }

  const submittingUserDoc = await getUserDoc(submittingUser?.uid ?? '');

  const updateUserFields = z.object({
    uid: z.string(),
    email: emailValue('user email'),
    firstName: z.string(),
    surname: z.string(),
    role: z.string(),
  });

  const validatedBody = updateUserFields.safeParse(request.body);

  if (!submittingUserDoc) {
    response.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
    return;
  }

  if (!validatedBody.success) {
    functions.logger.error(validatedBody.error);
    response.status(BAD_REQUEST).send({ message: 'Missing required fields' });
    return;
  }

  const { uid, role, firstName, surname, email } = validatedBody.data;

  const userToUpdate = await db.collection(USERS_COLLECTION).doc(uid).get();

  if (!userToUpdate.exists) {
    response.status(NOT_FOUND).send({ message: 'User does not exist' });
    return;
  }

  const typedUserToUpDate = userToUpdate.data() as UserSchema;

  if (typedUserToUpDate.companyId !== submittingUserDoc.companyId) {
    response.status(NOT_FOUND).send({ message: 'User does not exist' });
    return;
  }

  try {
    await Promise.all([
      admin.auth().setCustomUserClaims(uid, {
        role,
        email: email,
        displayName: firstName + ' ' + surname,
      }),
      db.collection(USERS_COLLECTION).doc(uid).update({
        firstName,
        surname,
        email,
        updatedAt: Date.now(),
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
  const [isAdmin, submittingUser] = await Promise.all([
    validateAdmin(request),
    getUser(request),
  ]);

  if (!isAdmin || !submittingUser) {
    response.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
    return;
  }

  const submittingUserDoc = await getUserDoc(submittingUser?.uid ?? '');

  if (!submittingUserDoc) {
    response.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
    return;
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

  const userToUpdate = await db.collection(USERS_COLLECTION).doc(uid).get();

  if (!userToUpdate.exists) {
    response.status(NOT_FOUND).send({ message: 'User does not exist' });
    return;
  }

  const typedUserToUpDate = userToUpdate.data() as UserSchema;

  if (typedUserToUpDate.companyId !== submittingUserDoc.companyId) {
    response.status(NOT_FOUND).send({ message: 'User does not exist' });
    return;
  }

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
