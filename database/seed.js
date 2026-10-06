/**
 * MindCare Database Seeder
 * Populates MongoDB with realistic historical demo data spanning the past 45–60 days
 * (up to yesterday at the latest).
 *
 * Usage (from backend/):  npm run seed
 * Or directly:            node database/seed.js
 */
const path = require("path");
module.paths.push(path.join(__dirname, "../backend/node_modules"));

require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });
const { seedHistoricalData } = require("./seedHistoricalData");

async function seedData(options = {}) {
  return await seedHistoricalData(options);
}

// Standalone execution
if (require.main === module) {
  const { connectDB, disconnectDB } = require("../backend/config/db");
  (async () => {
    await connectDB();
    await seedData({ forceClear: true });
    await disconnectDB();
  })().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
}

module.exports = { seedData };
