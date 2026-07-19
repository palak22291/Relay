// src/hooks/useRealtimeComments.js
// PostDetails listeners. Joins the post's room on mount, leaves on unmount.
//   comment:new      → prepend (dedupe by id, skip own via actorId)
//   comment:updated  → map-replace content
//   comment:deleted  → filter out
//   like:updated     → patch this post's absolute like count
// Room membership is lost on reconnect, so the reconnect handler re-joins.
import { useEffect } from "react";
import { useSocket } from "./useSocket";

export function useRealtimeComments({ postId, currentUserId, setComments, onLikeUpdated, refetch }) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !postId) return;

    socket.emit("post:join", postId);

    const onNew = ({ comment, actorId }) => {
      if (currentUserId && actorId === currentUserId) return;
      setComments((prev) =>
        prev.some((c) => c.id === comment.id) ? prev : [comment, ...prev]
      );
    };

    const onUpdated = ({ commentId, content }) =>
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, content } : c))
      );

    const onDeleted = ({ commentId }) =>
      setComments((prev) => prev.filter((c) => c.id !== commentId));

    const onLike = (payload) => {
      if (payload.postId === Number(postId)) onLikeUpdated?.(payload);
    };

    // re-join (room membership is lost) and refetch the list — events that
    // fired while disconnected are not replayed
    const onReconnect = () => {
      socket.emit("post:join", postId);
      refetch?.();
    };

    socket.on("comment:new", onNew);
    socket.on("comment:updated", onUpdated);
    socket.on("comment:deleted", onDeleted);
    socket.on("like:updated", onLike);
    socket.io.on("reconnect", onReconnect);

    // CRITICAL: leave the room and remove exactly these handler references —
    // otherwise route navigation stacks duplicate listeners
    return () => {
      socket.emit("post:leave", postId);
      socket.off("comment:new", onNew);
      socket.off("comment:updated", onUpdated);
      socket.off("comment:deleted", onDeleted);
      socket.off("like:updated", onLike);
      socket.io.off("reconnect", onReconnect);
    };
  }, [socket, postId, currentUserId, setComments, onLikeUpdated, refetch]);
}
