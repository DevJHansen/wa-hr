import * as admin from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import type * as functions from 'firebase-functions';
import { USERS_COLLECTION } from '../constants/firestoreConstants';
import { UserSchema } from '../schemas/userSchema';

export const validateAdmin = async (
  request: functions.https.Request
): Promise<boolean> => {
  const { headers } = request;

  const token = headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return false;
  }

  const user = await admin.auth().verifyIdToken(token);

  if (!user.email) {
    return false;
  }

  const userRecord = await admin.auth().getUser(user.uid);

  if (userRecord.customClaims?.role !== 'admin') {
    return false;
  }

  return true;
};

export const validateUser = async (
  request: functions.https.Request
): Promise<boolean> => {
  const { headers } = request;

  const token = headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return false;
  }

  const user = await admin.auth().verifyIdToken(token);

  if (!user.email) {
    return false;
  }

  return true;
};

export const getUser = async (
  request: functions.https.Request
): Promise<DecodedIdToken | undefined> => {
  const { headers } = request;

  const token = headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return undefined;
  }

  const user = await admin.auth().verifyIdToken(token);

  if (!user.email) {
    return undefined;
  }

  return user;
};

export const getUserDoc = async (uid: string) => {
  const submittingUserRef = admin
    .firestore()
    .collection(USERS_COLLECTION)
    .doc(uid)
    .get();

  if (!(await submittingUserRef).exists) {
    return undefined;
  }

  const userDoc = (await submittingUserRef).data() as UserSchema;
  return userDoc;
};
