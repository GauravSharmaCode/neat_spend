import { Firestore } from "@google-cloud/firestore";
import firestoreConfig from "../src/config/firestore";
import * as fs from "fs";

// Skip Firestore tests in CI environment where credentials don't exist
const hasCredentials = fs.existsSync(firestoreConfig.keyFilename);
const describeOrSkip = hasCredentials ? describe : describe.skip;

describeOrSkip("Firestore Connection", () => {
  let firestore: Firestore;

  beforeAll(() => {
    firestore = new Firestore({
      projectId: firestoreConfig.projectId,
      keyFilename: firestoreConfig.keyFilename,
    });
  });

  it("should connect and list collections", async () => {
    const collections = await firestore.listCollections();
    expect(Array.isArray(collections)).toBe(true);
  });

  it("should write and read test document", async () => {
    const testDoc = firestore.collection('test').doc('connection-test');
    
    await testDoc.set({ test: true, timestamp: new Date() });
    
    const doc = await testDoc.get();
    expect(doc.exists).toBe(true);
    expect(doc.data()?.test).toBe(true);
    
    await testDoc.delete();
  });
});
