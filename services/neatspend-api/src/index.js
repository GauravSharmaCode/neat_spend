const express = require("express");
const { prisma } = require("./prisma");
const { logWithMeta } = require("../../../neatspend-logger");
const { requestLogger } = require("./requestLogger");
const app = express();
app.use(express.json());
app.use(requestLogger);

app.get("/", (req, res) => {
  logWithMeta("Root endpoint hit", { func: "/" });
  res.send("NeatSpend API is running!");
});

// Fetch all users from the database
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    logWithMeta(`Fetched users: ${JSON.stringify(users)}`, { func: "/users" });
    res.json(users);
  } catch (err) {
    logWithMeta(`Error fetching users: ${err.message}`, { func: "/users" });
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  logWithMeta(`API listening on port ${PORT}`, { func: "listen" });
});
