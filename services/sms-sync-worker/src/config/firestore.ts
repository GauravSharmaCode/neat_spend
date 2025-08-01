import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../../.env.local") });

export interface FirestoreConfig {
  projectId: string;
  keyFilename: string;
}

const firestoreConfig: FirestoreConfig = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || "ultra-heading-467619-r5",
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(
    __dirname,
    "../..",
    "keys",
    "ultra-heading-467619-r5-917350c3132c.json"
  ),
};

export default firestoreConfig;
