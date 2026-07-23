// src/context/ConversationsContext.jsx
// One shared source for the conversation list, so the navbar unread badge and
// the /messages page use a single fetch + a single `conversation:updated`
// listener (same reasoning as CurrentUserContext — no duplicate fetches,
// no divergent state).
//
// Fetches when a token exists; listens on the shared socket for
// `conversation:updated` (delivered to the per-user `user:{id}` room) and
// re-sorts / re-badges without a full refetch.
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { useSocket } from "../hooks/useSocket";
import { useCurrentUser } from "./CurrentUserContext";

const ConversationsContext = createContext({
  conversations: [],
  totalUnread: 0,
  loading: true,
  refresh: () => {},
  markConversationRead: () => {},
});

// newest activity first
const byUpdatedDesc = (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt);

export function ConversationsProvider({ children }) {
  const socket = useSocket();
  const { currentUser } = useCurrentUser();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // re-read the token on route change (login/logout always navigate)
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  useEffect(() => {
    setToken(localStorage.getItem("authToken"));
  }, [location]);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem("authToken")) {
      setConversations([]);
      setLoading(false);
      return;
    }
    try {
      const res = await axiosInstance.get("/chat/conversations");
      setConversations((res.data.conversations || []).sort(byUpdatedDesc));
    } catch {
      // leave whatever we had; a failed fetch shouldn't blank the list
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [token, refresh]);

  // locally zero a conversation's unread (called by the chat window on read)
  const markConversationRead = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      )
    );
  }, []);

  // live list updates
  useEffect(() => {
    if (!socket) return;

    const onConversationUpdated = ({ conversationId, lastMessage, updatedAt, actorId }) => {
      const meId = currentUser?.userId;
      setConversations((prev) => {
        const existing = prev.find((c) => c.id === conversationId);

        // a brand-new conversation (e.g. someone just DMed me) isn't in the
        // list yet, and this payload lacks participants — refetch to get it
        if (!existing) {
          refresh();
          return prev;
        }

        const isMine = meId != null && actorId === meId;
        const isOpen = location.pathname === `/messages/${conversationId}`;

        const updated = prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                lastMessage: lastMessage || c.lastMessage,
                updatedAt: updatedAt || c.updatedAt,
                // my own message never bumps unread; and if I'm looking at
                // the conversation right now it's effectively already read
                unreadCount:
                  isMine || isOpen ? c.unreadCount : (c.unreadCount || 0) + 1,
              }
            : c
        );
        return updated.sort(byUpdatedDesc);
      });
    };

    // missed events while disconnected — refetch the whole list
    const onReconnect = () => refresh();

    socket.on("conversation:updated", onConversationUpdated);
    socket.io.on("reconnect", onReconnect);

    return () => {
      socket.off("conversation:updated", onConversationUpdated);
      socket.io.off("reconnect", onReconnect);
    };
  }, [socket, currentUser, location.pathname, refresh]);

  const totalUnread = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  );

  return (
    <ConversationsContext.Provider
      value={{ conversations, totalUnread, loading, refresh, markConversationRead }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

export const useConversations = () => useContext(ConversationsContext);
