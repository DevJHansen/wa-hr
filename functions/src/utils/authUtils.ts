import * as admin from 'firebase-admin';
import type * as functions from 'firebase-functions';

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
