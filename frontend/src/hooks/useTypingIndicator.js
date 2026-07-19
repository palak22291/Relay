// src/hooks/useTypingIndicator.js
// Phase 5 — typing indicators for the comment composer.
// Sending: throttled typing:start (max 1 per 2s) on keystrokes, debounced
// typing:stop after 2s of inactivity or on submit.
// Receiving: shows the typist's name, with a 3s client-side auto-clear as a
// safety net in case the typing:stop event is lost.
import { useEffect, useRef, useState, useCallback } from "react";
import { useSocket } from "./useSocket";

const START_THROTTLE_MS = 2000;
const STOP_DEBOUNCE_MS = 2000;
const SAFETY_CLEAR_MS = 3000;

export function useTypingIndicator({ postId, currentUserId, firstName }) {
  const socket = useSocket();
  const [typingUser, setTypingUser] = useState(null);

  const lastStartRef = useRef(0);
  const stopTimerRef = useRef(null);
  const clearTimerRef = useRef(null);

  // receiving side
  useEffect(() => {
    if (!socket || !postId) return;

    const onStart = ({ userId, firstName: name }) => {
      if (currentUserId && userId === currentUserId) return;
      setTypingUser(name || "Someone");
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => setTypingUser(null), SAFETY_CLEAR_MS);
    };
    const onStop = () => {
      clearTimeout(clearTimerRef.current);
      setTypingUser(null);
    };

    socket.on("typing:start", onStart);
    socket.on("typing:stop", onStop);

    return () => {
      socket.off("typing:start", onStart);
      socket.off("typing:stop", onStop);
      clearTimeout(clearTimerRef.current);
      clearTimeout(stopTimerRef.current);
      setTypingUser(null);
    };
  }, [socket, postId, currentUserId]);

  // sending side — call on every composer keystroke
  const notifyTyping = useCallback(() => {
    if (!socket || !postId) return;

    const now = Date.now();
    if (now - lastStartRef.current > START_THROTTLE_MS) {
      lastStartRef.current = now;
      socket.emit("typing:start", { postId, firstName });
    }

    clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      socket.emit("typing:stop", { postId });
    }, STOP_DEBOUNCE_MS);
  }, [socket, postId, firstName]);

  // call on submit so the indicator clears immediately for others
  const stopTyping = useCallback(() => {
    if (!socket || !postId) return;
    clearTimeout(stopTimerRef.current);
    lastStartRef.current = 0;
    socket.emit("typing:stop", { postId });
  }, [socket, postId]);

  return { typingUser, notifyTyping, stopTyping };
}
