const request = require("supertest");
const express = require("express");

/**
 * Creates a test Express app with a health endpoint, root endpoint, and dummy
 * sync endpoint. The dummy sync endpoint always returns a 200 with a count of
 * the messages array length, simulating a successful Firestore write.
 *
 * @returns {Express.Application} The test Express app.
 */
const createTestApp = () => {
  const app = express();

  app.use(express.json());

  // Health endpoint
  app.get("/health", (req, res) => {
    res.json({
      status: "success",
      message: "Service is healthy",
      service: "sms-sync-worker",
      timestamp: new Date().toISOString(),
    });
  });

  // Root endpoint
  app.get("/", (req, res) => {
    res.json({
      service: "sms-sync-worker",
      version: "1.0.0",
      status: "running",
    });
  });

  // Dummy sync endpoint
  app.post("/sync", (req, res) => {
    const { userId, messages } = req.body;

    if (!userId || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // Imagine calling user-service here to verify auth.
    // But in dev, assume always authenticated.

    // Simulate Firestore write here (skipped in test).
    res.status(200).json({
      status: "synced",
      count: messages.length,
    });
  });

  return app;
};

describe("SMS Sync Worker API", () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe("Health and Info Endpoints", () => {
    it("should return service info at root endpoint", async () => {
      const res = await request(app).get("/");
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("service", "sms-sync-worker");
      expect(res.body).toHaveProperty("version", "1.0.0");
      expect(res.body).toHaveProperty("status", "running");
    });

    it("should return health check", async () => {
      const res = await request(app).get("/health");
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("status", "success");
      expect(res.body).toHaveProperty("message", "Service is healthy");
      expect(res.body).toHaveProperty("service", "sms-sync-worker");
    });
  });

  describe("Message Sync", () => {
    it("should return 400 for missing payload", async () => {
      const res = await request(app).post("/sync").send({});
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("should sync messages successfully", async () => {
      const samplePayload = {
        userId: "abc123",
        messages: [
          { id: 1, body: "Test message 1" },
          { id: 2, body: "Test message 2" },
        ],
      };

      const res = await request(app).post("/sync").send(samplePayload);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("status", "synced");
      expect(res.body).toHaveProperty("count", samplePayload.messages.length);
    });
  });
});
