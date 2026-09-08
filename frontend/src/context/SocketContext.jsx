import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
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

    const token = localStorage.getItem("token"); // Assuming standard token storage, fallback to your auth logic
    
    // Check if token exists before connecting
    if (!token) return;

    const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);

    // Initial unread fetch
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/chat/unread-count`, {
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
