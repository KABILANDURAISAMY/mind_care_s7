const express = require("express");
const protect = require("../middleware/authMiddleware");
const { attachRoleProfile } = require("../middleware/roleMiddleware"); // Ensure this is created if not exists
const {
  getConversations,
  createOrGetConversation,
  getMessages,
  sendMessage,
  markMessagesRead,
  getUnreadCount
} = require("../controllers/chatController");

const router = express.Router();

router.get("/conversations", protect, attachRoleProfile, getConversations);
router.post("/conversations", protect, attachRoleProfile, createOrGetConversation);
router.get("/conversations/:conversationId/messages", protect, attachRoleProfile, getMessages);
router.post("/conversations/:conversationId/messages", protect, attachRoleProfile, sendMessage);
router.patch("/conversations/:conversationId/read", protect, attachRoleProfile, markMessagesRead);
router.get("/unread-count", protect, getUnreadCount);

module.exports = router;
