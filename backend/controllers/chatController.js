const Conversation = require("../models/Conversation");
const ChatMessage = require("../models/ChatMessage");

// @desc    Get all conversations for the authenticated user
// @route   GET /api/chat/conversations
// @access  Private (Student / Counsellor)
const getConversations = async (req, res) => {
  try {
    const isStudent = req.user.role === "student";
    let query = {};

    if (isStudent) {
      query.studentId = req.studentId; // Requires studentId from req via attachRoleProfile
    } else if (req.user.role === "counsellor") {
      query.counsellorId = req.counsellorId;
    }

    const conversations = await Conversation.find(query)
      .populate("studentId", "name rollNumber department email userId")
      .populate("counsellorId", "name title qualification specialization email userId")
      .sort({ updatedAt: -1 });

    // Also get unread counts for each conversation
    const convData = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await ChatMessage.countDocuments({
          conversationId: conv._id,
          receiverId: req.user._id,
          read: false,
        });
        return { ...conv.toObject(), unreadCount };
      })
    );

    res.json(convData);
  } catch (error) {
    console.error("Fetch conversations error:", error);
    res.status(500).json({ message: "Failed to fetch conversations." });
  }
};

// @desc    Create or find a conversation between student and counsellor
// @route   POST /api/chat/conversations
// @access  Private
const createOrGetConversation = async (req, res) => {
  try {
    const isStudent = req.user.role === "student";
    let studentId, counsellorId;

    if (isStudent) {
      studentId = req.studentId;
      counsellorId = req.body.counsellorId;
    } else {
      counsellorId = req.counsellorId;
      studentId = req.body.studentId;
    }

    if (!studentId || !counsellorId) {
      return res.status(400).json({ message: "Both studentId and counsellorId are required." });
    }

    let conversation = await Conversation.findOne({ studentId, counsellorId })
      .populate("studentId", "name rollNumber department email userId")
      .populate("counsellorId", "name title qualification specialization email userId");

    if (!conversation) {
      conversation = await Conversation.create({ studentId, counsellorId });
      conversation = await Conversation.findById(conversation._id)
        .populate("studentId", "name rollNumber department email userId")
        .populate("counsellorId", "name title qualification specialization email userId");
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Create conversation error:", error);
    res.status(500).json({ message: "Failed to create or fetch conversation." });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/conversations/:conversationId/messages
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    // Authorization check
    const isStudent = req.user.role === "student";
    if (isStudent && conversation.studentId.toString() !== req.studentId.toString()) {
      return res.status(403).json({ message: "Unauthorized access." });
    }
    if (!isStudent && conversation.counsellorId.toString() !== req.counsellorId.toString()) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    const messages = await ChatMessage.find({ conversationId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages." });
  }
};

// @desc    Send a message
// @route   POST /api/chat/conversations/:conversationId/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;
    
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    // Determine sender and receiver IDs based on roles.
    let receiverUserId;
    
    const isStudent = req.user.role === "student";
    if (isStudent) {
      if (conversation.studentId.toString() !== req.studentId.toString()) {
        return res.status(403).json({ message: "Unauthorized." });
      }
      // Needs to get counsellor's user ID. We can populate it.
      await conversation.populate("counsellorId");
      receiverUserId = conversation.counsellorId.userId;
    } else {
      if (conversation.counsellorId.toString() !== req.counsellorId.toString()) {
        return res.status(403).json({ message: "Unauthorized." });
      }
      await conversation.populate("studentId");
      receiverUserId = conversation.studentId.userId;
    }

    const newMessage = await ChatMessage.create({
      conversationId,
      senderId: req.user._id,
      receiverId: receiverUserId,
      senderRole: req.user.role,
      message
    });

    conversation.lastMessage = message;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Failed to send message." });
  }
};

// @desc    Mark messages as read
// @route   PATCH /api/chat/conversations/:conversationId/read
// @access  Private
const markMessagesRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Authorization check
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Not found" });

    const isStudent = req.user.role === "student";
    if (isStudent && conversation.studentId.toString() !== req.studentId.toString()) return res.status(403).json({ message: "Unauthorized." });
    if (!isStudent && conversation.counsellorId.toString() !== req.counsellorId.toString()) return res.status(403).json({ message: "Unauthorized." });

    await ChatMessage.updateMany(
      { conversationId, receiverId: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: "Messages marked as read." });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark messages as read." });
  }
};

// @desc    Get total unread count for badge
// @route   GET /api/chat/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await ChatMessage.countDocuments({
      receiverId: req.user._id,
      read: false
    });
    res.json({ count: unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to get unread count." });
  }
};

module.exports = {
  getConversations,
  createOrGetConversation,
  getMessages,
  sendMessage,
  markMessagesRead,
  getUnreadCount
};
