import express from "express";
import { register, login, logout } from "../controllers/authController";
import { userValidation } from "../middleware/validation";
import { optionalAuth } from "../middleware/auth";

const router = express.Router();

// Public authentication routes
router.post("/register", userValidation.create, register);
router.post("/login", userValidation.login, login);

// Protected authentication routes
router.post("/logout", optionalAuth, logout);

export default router;
