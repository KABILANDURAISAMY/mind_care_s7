import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

const ChatModule = () => {
  const { user } = useAuth();
  const { socket, setGlobalUnreadCount } = useSocket();
  
  const [conversations, setConversations] = useState([]);
  const [allCounsellors, setAllCounsellors] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);

  const isStudent = user?.role === "student";

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on("receive_message", handleReceiveMessage);
      socket.on("new_unread_message", handleNewUnreadMessage);
    }
    return () => {
      if (socket) {
        socket.off("receive_message", handleReceiveMessage);
        socket.off("new_unread_message", handleNewUnreadMessage);
      }
    };
  }, [socket, activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const convRes = await api.get("/chat/conversations");
      setConversations(convRes.data || []);

      if (isStudent) {
        const counsRes = await api.get("/student/counsellors");
        setAllCounsellors(counsRes.data || []);
      }
    } catch (err) {
      console.error("Fetch chat data error:", err);
      setError("Unable to load chat list. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get("/chat/conversations");
      setConversations(res.data || []);
    } catch (err) {
      console.error("Fetch conversations error:", err);
    }
  };

  const handleReceiveMessage = (data) => {
    if (activeConversation && data.conversationId === activeConversation._id) {
      setMessages((prev) => [...prev, data]);
      markAsRead(activeConversation._id);
    } else {
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === data.conversationId
            ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1, lastMessage: data.message, lastMessageAt: new Date() }
            : conv
        )
      );
    }
  };

  const handleNewUnreadMessage = (data) => {
    if (!activeConversation || data.conversationId !== activeConversation._id) {
      fetchConversations();
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await api.patch(`/chat/conversations/${conversationId}/read`);
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv._id === conversationId) {
            if (conv.unreadCount > 0) {
              setGlobalUnreadCount((count) => Math.max(0, count - conv.unreadCount));
            }
            return { ...conv, unreadCount: 0 };
          }
          return conv;
        })
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleSelectCounsellor = async (counsellor) => {
    setError(null);
    let conv = conversations.find(
      (c) =>
        c.counsellorId?._id === counsellor._id ||
        c.counsellorId === counsellor._id
    );

    if (!conv) {
      try {
        const res = await api.post("/chat/conversations", { counsellorId: counsellor._id });
        conv = res.data;
        setConversations((prev) => [conv, ...prev.filter((c) => c._id !== conv._id)]);
      } catch (err) {
        setError("Could not initialize chat session with this counsellor.");
        return;
      }
    }

    setActiveConversation(conv);
    if (socket) {
      socket.emit("join_room", conv._id);
    }

    try {
      const res = await api.get(`/chat/conversations/${conv._id}/messages`);
      setMessages(res.data || []);
      if (conv.unreadCount > 0) {
        markAsRead(conv._id);
      }
    } catch (err) {
      setError("Unable to load messages.");
    }
  };

  const handleSelectConversation = async (conv) => {
    setError(null);
    setActiveConversation(conv);
    if (socket) {
      socket.emit("join_room", conv._id);
    }

    try {
      const res = await api.get(`/chat/conversations/${conv._id}/messages`);
      setMessages(res.data || []);
      if (conv.unreadCount > 0) {
        markAsRead(conv._id);
      }
    } catch (err) {
      setError("Unable to load messages.");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const res = await api.post(`/chat/conversations/${activeConversation._id}/messages`, {
        message: newMessage,
      });

      const newMsg = res.data;
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");

      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConversation._id
            ? { ...c, lastMessage: newMsg.message, lastMessageAt: new Date() }
            : c
        )
      );

      if (socket) {
        socket.emit("send_message", newMsg);
      }
    } catch (err) {
      setError("Message could not be sent. Please try again.");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getCounsellorDisplayName = (counsellor) => {
    if (!counsellor) return "Counsellor";
    const name = counsellor.name || "";
    if (/^dr\.?/i.test(name)) return name;
    return counsellor.title ? `${counsellor.title} ${name}` : name;
  };

  const getStudentDisplayName = (student) => {
    if (!student) return "Student";
    return student.name || "Student";
  };

  const getActiveHeaderName = () => {
    if (!activeConversation) return "";
    if (isStudent) {
      const c = activeConversation.counsellorId;
      return getCounsellorDisplayName(c);
    } else {
      const s = activeConversation.studentId;
      return getStudentDisplayName(s);
    }
  };

  if (loading && conversations.length === 0 && allCounsellors.length === 0) {
    return <Loader label="Loading conversations" />;
  }

  return (
    <div className="flex h-[600px] bg-white rounded-xl shadow-md overflow-hidden border border-pine/10">
      {/* Sidebar List */}
      <div className="w-1/3 border-r flex flex-col bg-gray-50/50">
        <div className="p-4 border-b bg-white">
          <h2 className="text-lg font-bold text-pine font-display">
            {isStudent ? "Available Counsellors" : "Student Conversations"}
          </h2>
          <p className="text-xs text-gray-500 font-body">
            {isStudent
              ? "Select any counsellor to start a conversation"
              : "Only students with active conversations"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isStudent ? (
            /* Student View: List all counsellors */
            allCounsellors.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm">No counsellors registered.</p>
            ) : (
              allCounsellors.map((couns) => {
                const conv = conversations.find(
                  (c) =>
                    c.counsellorId?._id === couns._id ||
                    c.counsellorId === couns._id
                );
                const isActive =
                  activeConversation &&
                  (activeConversation.counsellorId?._id === couns._id ||
                    activeConversation.counsellorId === couns._id);

                return (
                  <div
                    key={couns._id}
                    onClick={() => handleSelectCounsellor(couns)}
                    className={`p-4 border-b cursor-pointer hover:bg-pine/5 transition-colors ${
                      isActive ? "bg-pine/10 border-l-4 border-pine" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold text-pine text-sm">
                          {getCounsellorDisplayName(couns)}
                        </h3>
                        {couns.specialization && (
                          <p className="text-xs text-sage-dark font-medium">
                            {couns.specialization}
                          </p>
                        )}
                      </div>
                      {conv && conv.unreadCount > 0 && (
                        <span className="bg-sunrise-dark text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink/60 truncate mt-1">
                      {conv?.lastMessage || "Click to start conversation..."}
                    </p>
                  </div>
                );
              })
            )
          ) : (
            /* Counsellor View: List ONLY conversations with students */
            conversations.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm">No student chats initiated yet.</p>
            ) : (
              conversations.map((conv) => {
                const student = conv.studentId;
                const isActive = activeConversation?._id === conv._id;

                return (
                  <div
                    key={conv._id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-4 border-b cursor-pointer hover:bg-pine/5 transition-colors ${
                      isActive ? "bg-pine/10 border-l-4 border-pine" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold text-pine text-sm">
                          {getStudentDisplayName(student)}
                        </h3>
                        {student?.department && (
                          <p className="text-xs text-ink/50">
                            {student.department} · {student.rollNumber || ""}
                          </p>
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-sunrise-dark text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink/60 truncate mt-1">
                      {conv.lastMessage || "No messages yet"}
                    </p>
                  </div>
                );
              })
            )
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <div className="p-4 border-b bg-white shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-pine font-display">
                  {getActiveHeaderName()}
                </h2>
                {isStudent && activeConversation.counsellorId?.qualification && (
                  <p className="text-xs text-ink/60 font-body">
                    {activeConversation.counsellorId.qualification}
                  </p>
                )}
                {!isStudent && activeConversation.studentId?.department && (
                  <p className="text-xs text-ink/60 font-body">
                    {activeConversation.studentId.department} · Roll No. {activeConversation.studentId.rollNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-mist/30 flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-ink/40 text-sm">
                  No messages yet. Send a message below to start chatting.
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = msg.senderId === user?._id || msg.senderId === user?.id;
                  return (
                    <div
                      key={idx}
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm font-body ${
                        isMine
                          ? "bg-pine text-mist self-end rounded-br-xs"
                          : "bg-white text-ink border border-pine/10 self-start rounded-bl-xs shadow-soft"
                      }`}
                    >
                      <p>{msg.message}</p>
                      <span
                        className={`text-[10px] block mt-1 ${
                          isMine ? "text-mist/70 text-right" : "text-ink/40 text-left"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-pine/10">
              {error && <p className="text-rose-600 text-xs mb-2">{error}</p>}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-pine/20 rounded-xl px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-pine/30"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="btn-primary !py-2.5 !px-6 text-sm disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-ink/40 bg-mist/20 p-6 text-center">
            <span className="text-3xl mb-2">💬</span>
            <p className="font-display font-semibold text-pine text-lg">
              {isStudent ? "Select a counsellor to chat" : "Select a student conversation"}
            </p>
            <p className="font-body text-xs text-ink/60 mt-1 max-w-sm">
              {isStudent
                ? "You can connect directly with any registered mental health counsellor."
                : "Student messages will appear here once initiated."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatModule;
