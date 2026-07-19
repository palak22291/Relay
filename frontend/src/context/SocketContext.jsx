// src/context/SocketContext.jsx
// One socket for the whole app — created when a token exists, torn down on
// logout. REST stays the write path; the socket only receives broadcasts.
import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

// socket connects to the API ORIGIN (no /api path) — derive it from
// REACT_APP_API_URL unless REACT_APP_SOCKET_URL is set explicitly
const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  (process.env.REACT_APP_API_URL
    ? new URL(process.env.REACT_APP_API_URL).origin
    : undefined);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const location = useLocation();
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));

  // localStorage writes don't fire events in the same tab — but login and
  // logout always navigate, so re-read the token on every route change
  useEffect(() => {
    setToken(localStorage.getItem("authToken"));
  }, [location]);

  useEffect(() => {
    if (!token) return; // logged out — no live updates (v1)

    const s = io(SOCKET_URL, { auth: { token } });
    setSocket(s);
    if (process.env.NODE_ENV === "development") window.__socket = s; // leak checks in dev tools

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [token]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export const useSocket = () => useContext(SocketContext);
