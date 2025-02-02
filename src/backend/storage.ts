import { firebaseApp } from './firebase';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getMetadata,
  deleteObject,
  connectStorageEmulator,
  getDownloadURL,
} from 'firebase/storage';
import { createDownloadLink } from './storageUtils';

const { VITE_FIREBASE_PROJECT_ID = '', VITE_APP_ENV = '' } = import.meta.env;

export const storage = getStorage(
  firebaseApp,
  `${VITE_FIREBASE_PROJECT_ID}.appspot.com`
);

if (VITE_APP_ENV === 'local') {
  const storagePort = 9991;
  connectStorageEmulator(storage, 'localhost', storagePort);
}

/**
 * @description Uploads a file to Google Cloud Storage.
 * @param path the path to the file
 * @param file the file to upload
 * @returns the path to the file, the status, the bucket and a download link
 */
export const uploadFile = async (
  path: string,
  file: File,
  fileName?: string
) => {
  try {
    const fileRef = ref(
      storage,
      `${path}/${+new Date() + (fileName ?? file.name)}`
    );

    await uploadBytesResumable(fileRef, file);
    const metaData = await getMetadata(fileRef);

    return {
      success: true,
      path,
      link: createDownloadLink(metaData.bucket, metaData.fullPath),
      bucket: metaData.bucket,
    };
  } catch (e) {
    console.error(e);
    return { success: false, path };
  }
};

/**
 * @description Uploads a file to Google Cloud Storage.
 * @param path the path to the file
 * @param file the file to upload
 * @returns the path to the file
 */
export const uploadFileAdReturnLink = async (path: string, file: File) => {
  try {
    const fileRef = ref(storage, `${path}/${+new Date() + file.name}`);

    await uploadBytesResumable(fileRef, file);
    const metaData = await getMetadata(fileRef);

    return createDownloadLink(metaData.bucket, metaData.fullPath);
  } catch (e) {
    console.error(e);
    return null;
  }
};

/**
 * @description Deletes a file from Google Cloud Storage.
 * @param path the path to the file
 * @returns the result of the operation
 */
export const deleteFile = async (path: string) => {
  try {
    const fileRef = ref(storage, path);

    await deleteObject(fileRef);

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
};

export function base64ToFile(base64String: string, fileName: string) {
  const mimeType = base64String.match(/data:(.*?);base64,/)?.[1];

  const byteString = atob(base64String.split(',')[1]);

  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([uint8Array], { type: mimeType });

  return new File([blob], fileName, { type: mimeType });
}

export async function getAuthedFileUrl(urlString: string): Promise<string> {
  const parsedUrl = new URL(urlString);

  const fileRef = ref(
    storage,
    parsedUrl.pathname.replace('/wa-hr-f072a.appspot.com', '')
  );

  try {
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching file path');
  }
}
