import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
admin.initializeApp();
const db = admin.firestore();
import cors from 'cors';
import {
  handleCreateUser,
  handleDeleteUser,
  handleUpdateUser,
} from './handlers/userHandlers';
import { backup } from './handlers/backup';

const corsHandler = cors({ origin: true });

const config = {
  region: 'europe-west3',
  allowUnauthorized: true,
};

const regionFunction = functions.region('europe-west3');

/**
 * ==================================================================================
 * USER HANDLERS
 * ==================================================================================
 */
export const createUser = onRequest(config, async (request, response) => {
  return corsHandler(request, response, async () => {
    await handleCreateUser(request, response, db);
  });
});

export const updateUser = onRequest(config, async (request, response) => {
  return corsHandler(request, response, async () => {
    await handleUpdateUser(request, response, db);
  });
});

export const deleteUser = onRequest(config, async (request, response) => {
  return corsHandler(request, response, async () => {
    await handleDeleteUser(request, response, db);
  });
});

/**
 * ==================================================================================
 * DAILY BACKUP FUNCTION
 * ==================================================================================
 */
export const dbBackup = regionFunction.pubsub
  .schedule('every day 00:00')
  .timeZone('Africa/Windhoek')
  .onRun(async () => {
    try {
      await backup();
    } catch (err) {
      console.error('error running db backup', err);
    }
  });
