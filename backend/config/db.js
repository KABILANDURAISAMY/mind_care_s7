const mongoose = require("mongoose");
const dns = require("dns");

// Configure public DNS servers to resolve MongoDB Atlas SRV records
// on systems where local DNS returns ECONNREFUSED for SRV queries.
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (e) {
  // Ignore if DNS server configuration is restricted
}

let memoryServer = null;

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
    serverSelectionTimeoutMS: 2500,
  };

  const primaryUri = process.env.MONGO_URI;
  const localUri = "mongodb://127.0.0.1:27017/mindcare";
  let connected = false;

  // Attempt 1: Configured MONGO_URI (if provided)
  if (primaryUri) {
    try {
      console.log(`[DB] Attempting connection to configured MONGO_URI...`);
      const conn = await mongoose.connect(primaryUri, connectionOptions);
      console.log(`[DB] Connected successfully to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
      await checkAndAutoSeed();
      return conn;
    } catch (error) {
      console.warn(`[DB] Primary MONGO_URI connection failed (${error.message}).`);
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
      console.warn(`[DB] Local MongoDB connection failed (${error.message}).`);
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
    console.log(`[DB] Successfully started & connected to In-Memory MongoDB Server at: ${memoryUri}`);
    await checkAndAutoSeed();
    return conn;
  } catch (memError) {
    console.error(`[DB] All MongoDB connection attempts failed.`);
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
