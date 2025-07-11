// Prisma client usage example
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { logWithMeta } = require("../../../neatspend-logger");

// Example: get all users
async function getAllUsers() {
  logWithMeta("Fetching all users", { func: "getAllUsers" });
  return await prisma.user.findMany();
}

module.exports = { prisma, getAllUsers };
