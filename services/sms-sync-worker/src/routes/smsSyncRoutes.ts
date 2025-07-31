import { Router, Request, Response, NextFunction } from "express";
import {
  syncAllMessages,
  syncSingleMessage,
  getAllMessages,
  getSingleMessage,
  updateMessage,
  deleteMessage
} from "../controllers/smsSyncController";

const router = Router();

// POST /api/v1/sms-sync/full - Full sync of all messages
router.post("/full", syncAllMessages);

// POST /api/v1/sms-sync/message - Sync a single message
router.post("/message", syncSingleMessage);

// CRUD endpoints
router.get("/messages", getAllMessages); // Get all messages for a user
router.get("/message/:id", getSingleMessage); // Get a single message by ID
router.patch("/message/:id", updateMessage); // Update a message by ID
router.delete("/message/:id", deleteMessage); // Delete a message by ID

export default router;
