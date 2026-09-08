const connectDB = require("./config/db");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function test() {
  await connectDB();
  const user = await User.findOne({ role: "student" }).select("+password");
  console.log("User:", user);
  if (user) {
    const isMatch = await bcrypt.compare("ArunPass1!", user.password);
    console.log("Password matches ArunPass1!:", isMatch);
  }
  process.exit();
}

test();

test();
