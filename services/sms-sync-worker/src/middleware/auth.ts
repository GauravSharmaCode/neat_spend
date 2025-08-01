import { Request, Response, NextFunction } from "express";
import { verifyUserAccess } from "../services/userServiceClient";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

/**
 * Authentication middleware to protect routes from unauthenticated access.
 *
 * @param {Request} req Express request object.
 * @param {Response} res Express response object.
 * @param {NextFunction} next Express next middleware function.
 *
 * @returns {Promise<void>} Returns nothing.
 *
 * @throws {Error} If authentication fails, it sends a 401 error response.
 */
export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        status: "fail",
        message: "You are not logged in! Please log in to get access.",
      });
      return;
    }

    // Let user service handle all authentication
    const user = await verifyUserAccess(token);
    if (!user) {
      res.status(401).json({
        status: "fail",
        message: "Invalid token or user not found.",
      });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({
      status: "fail",
      message: "Authentication failed.",
    });
  }
};
