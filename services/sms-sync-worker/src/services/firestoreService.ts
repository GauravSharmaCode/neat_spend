
import { Firestore } from "@google-cloud/firestore";
import firestoreConfig from "../config/firestore";

// Initialize Firestore using config
const firestore = new Firestore({
  projectId: firestoreConfig.projectId,
  keyFilename: firestoreConfig.credentialsPath,
});

export async function saveMessagesToFirestore(userId: string, messages: any[]): Promise<void> {
  const batch = firestore.batch();
  const userRef = firestore.collection("users").doc(userId);
  const messagesRef = userRef.collection("messages");
  messages.forEach((msg) => {
    const msgRef = messagesRef.doc();
    batch.set(msgRef, msg);
  });
  await batch.commit();
}

export async function saveMessageToFirestore(userId: string, message: any): Promise<void> {
  const userRef = firestore.collection("users").doc(userId);
  const messagesRef = userRef.collection("messages");
  await messagesRef.add(message);
}

export async function getMessagesForUser(userId: string): Promise<any[]> {
  const messagesRef = firestore.collection("users").doc(userId).collection("messages");
  const snapshot = await messagesRef.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getMessageById(userId: string, messageId: string): Promise<any | null> {
  const docRef = firestore.collection("users").doc(userId).collection("messages").doc(messageId);
  const doc = await docRef.get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function updateMessageById(userId: string, messageId: string, message: any): Promise<void> {
  const docRef = firestore.collection("users").doc(userId).collection("messages").doc(messageId);
  await docRef.set(message, { merge: true });
}

export async function deleteMessageById(userId: string, messageId: string): Promise<void> {
  const docRef = firestore.collection("users").doc(userId).collection("messages").doc(messageId);
  await docRef.delete();
}
