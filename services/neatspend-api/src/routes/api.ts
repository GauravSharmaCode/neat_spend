import { Router } from "express";
import {
  userServiceProxy,
  smsServiceProxy,
  insightServiceProxy,
} from "../core/services/proxy";

const router = Router();

// proxy /api/v1/auth and /api/v1/users to user-service
router.use("/v1", userServiceProxy);

// SMS service routes (for future implementation)
router.use("/v1/sms", smsServiceProxy);

// Insight service routes (for future implementation)
router.use("/v1/insights", insightServiceProxy);

export default router;
