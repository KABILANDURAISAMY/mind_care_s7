import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

/**
 * Derive the base server URL (without /api suffix) for Socket.io connections.
 * VITE_API_URL typically ends with /api (e.g. https://mindcare-api.onrender.com/api)
 * but Socket.io must connect to the server root (e.g. https://mindcare-api.onrender.com).
 */
const getSocketBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  return apiUrl.replace(/\/api\/?$/, "");
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [globalUnreadCount, setGlobalUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const token = localStorage.getItem("mindcare_token");
    
    // Check if token exists before connecting
    if (!token) return;

    const socketUrl = getSocketBaseUrl();

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);

    // Initial unread fetch — use the API URL (already includes /api)
    const fetchUnreadCount = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${apiBaseUrl}/chat/unread-count`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        setGlobalUnreadCount(data.count || 0);
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };
    fetchUnreadCount();

    newSocket.on("new_unread_message", (data) => {
      setGlobalUnreadCount(prev => prev + 1);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const value = {
    socket,
    globalUnreadCount,
    setGlobalUnreadCount
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
