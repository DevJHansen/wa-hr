import { GOOGLE_STORAGE_LINK } from '../constants/firebaseConstants';

/**
 * Creates a download link for a file in Google Cloud Storage.
 *
 * @param bucket The storage bucket
 * @param path The path to the file
 * @returns Google Cloud Storage download link
 */
export const createDownloadLink = (bucket: string, path: string) => {
  if (bucket === '') {
    console.warn('Storage bucket was empty: ' + bucket);
  }

  if (path === '') {
    console.warn('Path was empty: ' + path);
  }

  return `${GOOGLE_STORAGE_LINK}/${bucket}/${path}`;
};
