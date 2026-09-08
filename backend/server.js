require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const counsellorRoutes = require("./routes/counsellorRoutes");
const chatRoutes = require("./routes/chatRoutes");
const wellnessRoutes = require("./routes/wellnessRoutes");

const app = express();
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Socket.io middleware for JWT authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return next(new Error("User not found"));
    
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log(`User connected to socket: ${socket.user.name} (${socket.id})`);

  socket.on("join_room", (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`User joined room: conversation_${conversationId}`);
  });

  socket.on("send_message", (data) => {
    // Expected data: { conversationId, message, senderId, receiverId, ... }
    io.to(`conversation_${data.conversationId}`).emit("receive_message", data);
    
    // Also notify receiver for unread badge if they are not in the room
    // Ideally, emit to a user-specific room for global notifications
    io.to(`user_${data.receiverId}`).emit("new_unread_message", data);
  });

  // User-specific room for global notifications (unread count)
  socket.join(`user_${socket.user._id}`);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.name}`);
  });
});


// --- Core middleware -------------------------------------------------
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// --- Health check ------------------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "MindCare API", time: new Date().toISOString() });
});

// --- Routes --------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/counsellor", counsellorRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/wellness", wellnessRoutes);

// --- Errors ----------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`[Server Error] Port ${PORT} is already in use by another process.`);
    console.error(`[Server Error] To resolve this, stop any process running on port ${PORT} or change PORT in .env.`);
    process.exit(1);
  } else {
    console.error("[Server Error]", err);
  }
});

const start = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`MindCare API & Socket listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("[Server Crash]", err);
    process.exit(1);
  }
};

process.on("SIGINT", () => {
  if (server) server.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  if (server) server.close();
  process.exit(0);
});

start();

