import { Router } from "express";
import {
  userServiceProxy,
  smsServiceProxy,
  insightServiceProxy,
} from "../core/services/proxy";

const router = Router();

// SMS service routes (for future implementation) - must come before user service
router.use("/v1/sms", smsServiceProxy);

// Insight service routes (for future implementation) - must come before user service
router.use("/v1/insights", insightServiceProxy);

// User service routes - auth and users (catch-all for /v1)
router.use("/v1", userServiceProxy);

export default router;
