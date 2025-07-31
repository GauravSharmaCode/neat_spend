import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

export interface FirestoreConfig {
  projectId: string;
  credentialsPath: string;
}

const firestoreConfig: FirestoreConfig = {
  projectId: process.env.FIRESTORE_PROJECT_ID || '',
  credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
};

if (!firestoreConfig.projectId) {
  // eslint-disable-next-line no-console
  console.error('FIRESTORE_PROJECT_ID is required');
  process.exit(1);
}
if (!firestoreConfig.credentialsPath) {
  // eslint-disable-next-line no-console
  console.error('GOOGLE_APPLICATION_CREDENTIALS is required');
  process.exit(1);
}

export default firestoreConfig;
