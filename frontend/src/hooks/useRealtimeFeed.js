// src/hooks/useRealtimeFeed.js
// Feed listeners for the broadcast events (Phase 2 emits):
//   post:new      → queue into the "N new posts" pill (never yank scroll)
//   post:deleted  → drop from list + queue
//   like:updated  → patch the absolute count into matching posts
// The actor's own events are skipped via actorId — they already updated
// from their REST response.
import { useEffect } from "react";
import { useSocket } from "./useSocket";

export function useRealtimeFeed({ currentUserId, setPosts, setQueuedPosts, refetch }) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const onNewPost = ({ post, actorId }) => {
      if (currentUserId && actorId === currentUserId) return;
      setQueuedPosts((prev) =>
        prev.some((p) => p.id === post.id) ? prev : [post, ...prev]
      );
    };

    const onDeleted = ({ postId }) => {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setQueuedPosts((prev) => prev.filter((p) => p.id !== postId));
    };

    const onLike = ({ postId, likeCount }) => {
      // absolute count from the server — assign, never increment
      const patch = (list) =>
        list.map((p) =>
          p.id === postId ? { ...p, _count: { ...p._count, likes: likeCount } } : p
        );
      setPosts(patch);
      setQueuedPosts(patch);
    };

    // missed events while disconnected — refetch page 1 rather than replay
    const onReconnect = () => refetch();

    socket.on("post:new", onNewPost);
    socket.on("post:deleted", onDeleted);
    socket.on("like:updated", onLike);
    socket.io.on("reconnect", onReconnect);

    // CRITICAL: remove exactly these handler references (StrictMode double-
    // mount and route navigation would otherwise stack duplicate handlers)
    return () => {
      socket.off("post:new", onNewPost);
      socket.off("post:deleted", onDeleted);
      socket.off("like:updated", onLike);
      socket.io.off("reconnect", onReconnect);
    };
  }, [socket, currentUserId, setPosts, setQueuedPosts, refetch]);
}
