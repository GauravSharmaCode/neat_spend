import { Request, Response, NextFunction } from "express";
import * as firestoreService from "../services/firestoreService";
import { logWithMeta } from "@gauravsharmacode/neat-logger";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

/**
 * Syncs all messages for a given user to Firestore.
 *
 * @param {AuthenticatedRequest} req - The request object containing the user ID and messages.
 * @param {Response} res - The response object to send the response.
 * @param {NextFunction} next - The next middleware function.
 *
 * @returns {Promise<void>}
 */
async function syncAllMessages(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId, messages } = req.body;
    if (!userId || !Array.isArray(messages)) {
      res.status(400).json({
        status: "fail",
        message: "userId and messages[] are required",
      });
      return;
    }
    if (!req.user || userId !== req.user.id) {
      res.status(403).json({
        status: "fail",
        message: "Access denied. You can only sync your own messages.",
      });
      return;
    }

    logWithMeta("info", "Starting Firestore sync", {
      service: "sms-sync-worker",
      function: "syncAllMessages",
      userId,
      messageCount: messages.length,
    });

    await firestoreService.saveMessagesToFirestore(userId, messages);

    logWithMeta("info", "Firestore sync completed successfully", {
      service: "sms-sync-worker",
      function: "syncAllMessages",
      userId,
      messageCount: messages.length,
    });

    res.status(200).json({ status: "success", message: "All messages synced" });
  } catch (err) {
    next(err);
  }
}
async function syncSingleMessage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId, message } = req.body;
    if (!userId || !message) {
      res
        .status(400)
        .json({ status: "fail", message: "userId and message are required" });
      return;
    }
    if (!req.user || userId !== req.user.id) {
      res.status(403).json({
        status: "fail",
        message: "Access denied. You can only sync your own messages.",
      });
      return;
    }
    await firestoreService.saveMessageToFirestore(userId, message);
    res.status(200).json({ status: "success", message: "Message synced" });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves all messages for a user.
 *
 * @param {Request} req - The request object containing the userId in the query.
 * @param {Response} res - The response object to send the retrieved messages.
 * @param {NextFunction} next - The next middleware function.
 *
 * @returns {Promise<void>} - Resolves when the request is handled.
 */
async function getAllMessages(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== "string") {
      res.status(400).json({ status: "fail", message: "userId is required" });
      return;
    }
    if (!req.user || userId !== req.user.id) {
      res.status(403).json({
        status: "fail",
        message: "Access denied. You can only access your own messages.",
      });
      return;
    }
    const messages = await firestoreService.getMessagesForUser(userId);
    res.status(200).json({ status: "success", messages });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves a single message for a user by message ID.
 *
 * @param {AuthenticatedRequest} req - The request object containing the userId in the query and message id in params.
 * @param {Response} res - The response object to send the retrieved message or error status.
 * @param {NextFunction} next - The next middleware function for error handling.
 *
 * @returns {Promise<void>} - Resolves when the request is handled.
 *
 * @throws {Error} - If an error occurs during message retrieval.
 *
 * @description
 * This function checks if the userId and message id are provided and valid. It verifies that the requesting user matches the userId.
 * If the message is found, it is returned with a success status. If not, a 404 status is returned.
 * An appropriate error status is returned if any validation or access check fails.
 */
async function getSingleMessage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req.query;
    const { id } = req.params;
    if (!userId || typeof userId !== "string" || !id) {
      res.status(400).json({
        status: "fail",
        message: "userId and message id are required",
      });
      return;
    }
    if (!req.user || userId !== req.user.id) {
      res.status(403).json({
        status: "fail",
        message: "Access denied. You can only access your own messages.",
      });
      return;
    }
    const message = await firestoreService.getMessageById(userId, id);
    if (!message) {
      res.status(404).json({ status: "fail", message: "Message not found" });
      return;
    }
    res.status(200).json({ status: "success", message });
  } catch (err) {
    next(err);
  }
}

/**
 * Updates a message by its ID for a given user.
 *
 * @param {AuthenticatedRequest} req - The request object containing the userId in the query,
 *                                     message id in the params, and the new message content in the body.
 * @param {Response} res - The response object to send the response.
 * @param {NextFunction} next - The next middleware function.
 *
 * @returns {Promise<void>} - Resolves when the request is handled.
 *
 * @description
 * This function checks if the userId, message id, and new message content are provided and valid.
 * It verifies that the requesting user matches the userId. If the message is successfully updated,
 * a success status is returned. An appropriate error status is returned if any validation or access check fails.
 */
async function updateMessage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req.query;
    const { id } = req.params;
    const { message } = req.body;
    if (!userId || typeof userId !== "string" || !id || !message) {
      res.status(400).json({
        status: "fail",
        message: "userId, message id, and message are required",
      });
      return;
    }
    if (!req.user || userId !== req.user.id) {
      res.status(403).json({
        status: "fail",
        message: "Access denied. You can only update your own messages.",
      });
      return;
    }
    await firestoreService.updateMessageById(userId, id, message);
    res.status(200).json({ status: "success", message: "Message updated" });
  } catch (err) {
    next(err);
  }
}

/**
 * Deletes a message by its ID.
 *
 * @param {AuthenticatedRequest} req - The request object containing the userId in the query and the message id in the params.
 * @param {Response} res - The response object to send the response.
 * @param {NextFunction} next - The next middleware function.
 *
 * @returns {Promise<void>}
 */
async function deleteMessage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req.query;
    const { id } = req.params;
    if (!userId || typeof userId !== "string" || !id) {
      res.status(400).json({
        status: "fail",
        message: "userId and message id are required",
      });
      return;
    }
    if (!req.user || userId !== req.user.id) {
      res.status(403).json({
        status: "fail",
        message: "Access denied. You can only delete your own messages.",
      });
      return;
    }
    await firestoreService.deleteMessageById(userId, id);
    res.status(200).json({ status: "success", message: "Message deleted" });
  } catch (err) {
    next(err);
  }
}

export {
  syncAllMessages,
  syncSingleMessage,
  getAllMessages,
  getSingleMessage,
  updateMessage,
  deleteMessage,
};
