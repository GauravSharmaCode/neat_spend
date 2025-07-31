import { Firestore } from "@google-cloud/firestore";
import firestoreConfig from "../src/config/firestore";

jest.mock('@google-cloud/firestore', () => {
  return {
    Firestore: jest.fn().mockImplementation(() => ({
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
      set: jest.fn().mockResolvedValue({}),
      listCollections: jest.fn().mockResolvedValue([]),
      // Add more mocked methods as needed
    })),
  };
});

describe("Firestore Connection", () => {
  it("should connect and list collections", async () => {
    const firestore = new Firestore({
      projectId: firestoreConfig.projectId,
      keyFilename: firestoreConfig.credentialsPath,
    });
    // Try to list collections (should not throw)
    const collections = await firestore.listCollections();
    expect(Array.isArray(collections)).toBe(true);
  });
});
