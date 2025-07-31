import { Request, Response, NextFunction } from "express";
import * as firestoreService from "../services/firestoreService";
import { fetchUserById } from "../services/userServiceClient";

// POST /api/v1/sms-sync/full
export const syncAllMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, messages } = req.body;
    if (!userId || !Array.isArray(messages)) {
      return res.status(400).json({ status: "fail", message: "userId and messages[] are required" });
    }
    // Optionally fetch user data from user-service
    const user = await fetchUserById(userId);
    if (!user) {
      return res.status(404).json({ status: "fail", message: "User not found" });
    }
    await firestoreService.saveMessagesToFirestore(userId, messages);
    res.status(200).json({ status: "success", message: "All messages synced" });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/sms-sync/message
export const syncSingleMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, message } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ status: "fail", message: "userId and message are required" });
    }
    // Optionally fetch user data from user-service
    const user = await fetchUserById(userId);
    if (!user) {
      return res.status(404).json({ status: "fail", message: "User not found" });
    }
    await firestoreService.saveMessageToFirestore(userId, message);
    res.status(200).json({ status: "success", message: "Message synced" });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/sms-sync/messages?userId=... - Get all messages for a user
export const getAllMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ status: "fail", message: "userId is required" });
    }
    const user = await fetchUserById(userId);
    if (!user) {
      return res.status(404).json({ status: "fail", message: "User not found" });
    }
    const messages = await firestoreService.getMessagesForUser(userId);
    res.status(200).json({ status: "success", messages });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/sms-sync/message/:id?userId=... - Get a single message by ID
export const getSingleMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.query;
    const { id } = req.params;
    if (!userId || typeof userId !== "string" || !id) {
      return res.status(400).json({ status: "fail", message: "userId and message id are required" });
    }
    const user = await fetchUserById(userId);
    if (!user) {
      return res.status(404).json({ status: "fail", message: "User not found" });
    }
    const message = await firestoreService.getMessageById(userId, id);
    if (!message) {
      return res.status(404).json({ status: "fail", message: "Message not found" });
    }
    res.status(200).json({ status: "success", message });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/sms-sync/message/:id?userId=... - Update a message by ID
export const updateMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.query;
    const { id } = req.params;
    const { message } = req.body;
    if (!userId || typeof userId !== "string" || !id || !message) {
      return res.status(400).json({ status: "fail", message: "userId, message id, and message are required" });
    }
    const user = await fetchUserById(userId);
    if (!user) {
      return res.status(404).json({ status: "fail", message: "User not found" });
    }
    await firestoreService.updateMessageById(userId, id, message);
    res.status(200).json({ status: "success", message: "Message updated" });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/sms-sync/message/:id?userId=... - Delete a message by ID
export const deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.query;
    const { id } = req.params;
    if (!userId || typeof userId !== "string" || !id) {
      return res.status(400).json({ status: "fail", message: "userId and message id are required" });
    }
    const user = await fetchUserById(userId);
    if (!user) {
      return res.status(404).json({ status: "fail", message: "User not found" });
    }
    await firestoreService.deleteMessageById(userId, id);
    res.status(200).json({ status: "success", message: "Message deleted" });
  } catch (err) {
    next(err);
  }
};
