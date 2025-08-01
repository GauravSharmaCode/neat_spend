import { Firestore } from "@google-cloud/firestore";
import firestoreConfig from "../config/firestore";

// Initialize Firestore using config
const firestore = new Firestore({
  projectId: firestoreConfig.projectId,
  keyFilename: firestoreConfig.keyFilename,
});

/**
 * Saves an array of messages to the Firestore database.
 *
 * @param {string} userId - The ID of the user to save the messages for.
 * @param {unknown[]} messages - The messages to save, as an array of objects.
 *
 * @returns {Promise<void>} - A promise that resolves when all messages have been saved.
 *
 * @description
 * This function uses a Firestore batch to write all messages in a single operation.
 * If any of the messages fail to be written, the entire batch will be rolled back.
 */
export async function saveMessagesToFirestore(
  userId: string,
  messages: unknown[]
): Promise<void> {
  const batch = firestore.batch();
  const userRef = firestore.collection("users").doc(userId);
  const messagesRef = userRef.collection("messages");
  messages.forEach((msg) => {
    const msgRef = messagesRef.doc();
    batch.set(msgRef, msg as Record<string, unknown>);
  });
  await batch.commit();
}

/**
 * Saves a single message to the Firestore database.
 *
 * @param {string} userId - The ID of the user to save the message for.
 * @param {unknown} message - The message to save, as an object.
 *
 * @returns {Promise<void>} - A promise that resolves when the message has been saved.
 *
 * @description
 * This function is a simple wrapper around the Firestore add() method.
 * If the message fails to be written, the error will be thrown.
 */
export async function saveMessageToFirestore(
  userId: string,
  message: unknown
): Promise<void> {
  const userRef = firestore.collection("users").doc(userId);
  const messagesRef = userRef.collection("messages");
  await messagesRef.add(message as Record<string, unknown>);
}

/**
 * Retrieves all messages for a user.
 *
 * @param {string} userId - The ID of the user to retrieve messages for.
 *
 * @returns {Promise<unknown[]>} - A promise that resolves with an array of messages. Each message is an object with an "id" property and other properties as defined in the message document.
 *
 * @description
 * This function uses a Firestore query to retrieve all messages for the given user.
 * The messages are returned as an array of objects, where each object has an "id" property and other properties as defined in the message document.
 */
export async function getMessagesForUser(userId: string): Promise<unknown[]> {
  const messagesRef = firestore
    .collection("users")
    .doc(userId)
    .collection("messages");
  const snapshot = await messagesRef.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Retrieves a single message by ID for a user.
 *
 * @param {string} userId - The ID of the user to retrieve the message for.
 * @param {string} messageId - The ID of the message to retrieve.
 *
 * @returns {Promise<unknown | null>} - A promise that resolves with the message object if the message exists, or null otherwise. The message object has an "id" property and other properties as defined in the message document.
 *
 * @description
 * This function uses a Firestore query to retrieve a single message by ID for the given user.
 * If the message does not exist, the function returns null.
 */
export async function getMessageById(
  userId: string,
  messageId: string
): Promise<unknown | null> {
  const docRef = firestore
    .collection("users")
    .doc(userId)
    .collection("messages")
    .doc(messageId);
  const doc = await docRef.get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

/**
 * Updates a message by its ID for a specific user in the Firestore database.
 *
 * @param {string} userId - The ID of the user whose message is to be updated.
 * @param {string} messageId - The ID of the message to update.
 * @param {unknown} message - The new content for the message, as an object.
 *
 * @returns {Promise<void>} - A promise that resolves when the message has been updated.
 *
 * @description
 * This function updates the specified message in the Firestore database by merging the new
 * content with the existing message document. If the message does not exist, a new document
 * will be created with the provided content.
 */
export async function updateMessageById(
  userId: string,
  messageId: string,
  message: unknown
): Promise<void> {
  const docRef = firestore
    .collection("users")
    .doc(userId)
    .collection("messages")
    .doc(messageId);
  await docRef.set(message as Record<string, unknown>, { merge: true });
}

/**
 * Deletes a message by its ID for a specific user from the Firestore database.
 *
 * @param {string} userId - The ID of the user whose message is to be deleted.
 * @param {string} messageId - The ID of the message to delete.
 *
 * @returns {Promise<void>} - A promise that resolves when the message has been deleted.
 *
 * @description
 * This function deletes the specified message document from the Firestore database.
 * If the message does not exist, the operation will complete silently without error.
 */

export async function deleteMessageById(
  userId: string,
  messageId: string
): Promise<void> {
  const docRef = firestore
    .collection("users")
    .doc(userId)
    .collection("messages")
    .doc(messageId);
  await docRef.delete();
}
