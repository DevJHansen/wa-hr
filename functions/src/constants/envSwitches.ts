import * as admin from 'firebase-admin';

export const BUCKET_NAME = 'wa-hr-f072a.appspot.com';

export const { projectId } = admin.instanceId().app.options;
