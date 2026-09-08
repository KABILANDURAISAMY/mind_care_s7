const mongoose = require("mongoose");
const dns = require("dns");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Configure public DNS servers to resolve MongoDB Atlas SRV records
// on systems where local DNS returns ECONNREFUSED for SRV queries.
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (e) {
  // Ignore if DNS server configuration is restricted
}

let memoryServer = null;

/**
 * Sanitizes MongoDB connection URI by removing placeholder angle brackets around passwords/usernames.
 * e.g., mongodb+srv://user:<password>@cluster -> mongodb+srv://user:password@cluster
 */
function sanitizeMongoUri(uri) {
  if (!uri) return uri;
  // If string contains :<password>@ or similar angle brackets
  let sanitized = uri.replace(/:\s*<([^>]+)>\s*@/, ":$1@");
  // Remove any remaining angle brackets in user info portion
  const match = sanitized.match(/^(mongodb(?:\+srv)?:\/\/[^@]+@)(.+)$/);
  if (match) {
    const credentials = match[1].replace(/<([^>]+)>/g, "$1");
    sanitized = credentials + match[2];
  }
  return sanitized.trim();
}

const checkAndAutoSeed = async () => {
  try {
    const User = require("../models/User");
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("[DB] Empty database detected. Auto-seeding initial demo accounts...");
      const { seedData } = require("../../database/seed");
      await seedData();
    }
  } catch (err) {
    console.warn(`[DB] Auto-seed check warning: ${err.message}`);
  }
};

/**
 * Establishes MongoDB connection with intelligent fallback:
 * 1. Primary MONGO_URI (e.g. Atlas cluster or environment specified URI)
 * 2. Local MongoDB URI (mongodb://127.0.0.1:27017/mindcare)
 * 3. In-Memory MongoDB Server (zero-config fallback if external/local DB is offline)
 */
const connectDB = async () => {
  const connectionOptions = {
    serverSelectionTimeoutMS: 3000,
  };

  const rawPrimaryUri = process.env.MONGO_URI;
  const primaryUri = sanitizeMongoUri(rawPrimaryUri);
  const localUri = "mongodb://127.0.0.1:27017/mindcare";

  // Attempt 1: Configured MONGO_URI (if provided)
  if (primaryUri) {
    try {
      const maskedUri = primaryUri.replace(/:([^@]+)@/, ":****@");
      console.log(`[DB] Attempting connection to configured MONGO_URI (${maskedUri})...`);
      const conn = await mongoose.connect(primaryUri, connectionOptions);
      console.log(`[DB] Connected successfully to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
      await checkAndAutoSeed();
      return conn;
    } catch (error) {
      if (error.message.includes("bad auth")) {
        console.warn(`[DB Warning] MongoDB Atlas authentication failed (bad auth). Please verify username/password in backend/.env.`);
      } else {
        console.warn(`[DB Warning] Primary MONGO_URI connection failed (${error.message}).`);
      }
    }
  }

  // Attempt 2: Local MongoDB instance
  if (primaryUri !== localUri) {
    try {
      console.log(`[DB] Attempting connection to local MongoDB at ${localUri}...`);
      const conn = await mongoose.connect(localUri, connectionOptions);
      console.log(`[DB] Connected successfully to local MongoDB: ${conn.connection.host}/${conn.connection.name}`);
      await checkAndAutoSeed();
      return conn;
    } catch (error) {
      console.warn(`[DB Warning] Local MongoDB connection failed (${error.message}).`);
    }
  }

  // Attempt 3: In-Memory MongoDB Server (Zero-Config Fallback)
  try {
    console.log(`[DB] Initializing zero-config In-Memory MongoDB Server...`);
    const { MongoMemoryServer } = require("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create({
      binary: { version: "7.0.14" },
      instance: { dbName: "mindcare" },
    });
    const memoryUri = memoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[DB Fallback] Successfully started & connected to In-Memory MongoDB Server at: ${memoryUri}`);
    await checkAndAutoSeed();
    return conn;
  } catch (memError) {
    console.error(`[DB Error] All MongoDB connection attempts failed.`);
    console.error(`Error details: ${memError.message}`);
    process.exit(1);
  }
};

/**
 * Disconnects from MongoDB and stops in-memory server if active.
 */
const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.disconnectDB = disconnectDB;
