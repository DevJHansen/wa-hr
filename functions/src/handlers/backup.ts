import { GoogleAuth } from 'google-auth-library';
import { BUCKET_NAME, projectId } from '../constants/envSwitches';
import * as functions from 'firebase-functions';

const BACKUP_FOLDER = 'backups';

export async function backup() {
  functions.logger.info('start firebase backup');

  const auth = new GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/datastore',
      'https://www.googleapis.com/auth/cloud-platform',
    ],
  });
  const client = await auth.getClient();

  const url = `https://firestore.googleapis.com/v1beta1/projects/${projectId}/databases/(default):exportDocuments`;
  const backupFileName = new Date().toISOString();
  const backupUrl = `gs://${BUCKET_NAME}/${BACKUP_FOLDER}/${backupFileName}.json`;

  await client.request({
    url,
    method: 'POST',
    data: { outputUriPrefix: backupUrl },
  });

  functions.logger.info('end firebase backup');
}
