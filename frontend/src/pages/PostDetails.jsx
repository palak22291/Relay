// src/pages/PostDetails.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import axiosInstance from "../utils/axiosInstance";
import { getAvatarStyle } from "../utils/ui";
import { useRealtimeComments } from "../hooks/useRealtimeComments";
import { useTypingIndicator } from "../hooks/useTypingIndicator";

function CommentItem({ comment, currentUser, onUpdate, onDelete }) {
  const isOwner = currentUser?.userId === comment.authorId;
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.content);
  const [menuEl, setMenuEl] = useState(null);
  const avatarStyle = getAvatarStyle(comment.author?.id);

  const save = async () => {
    if (!text.trim()) return;
    await onUpdate(comment.id, text.trim());
    setEditing(false);
  };

  return (
    <Box sx={{ display: "flex", gap: 1.5, py: 1.5 }}>
      <Avatar
        sx={{
          width: 32,
          height: 32,
          backgroundColor: avatarStyle.bg,
          color: avatarStyle.color,
        }}
      >
        {comment.author?.firstName?.[0]?.toUpperCase() || "U"}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "text.primary" }}>
            {comment.author?.firstName}
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "text.disabled" }}>
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </Typography>
        </Box>
        {editing ? (
          <Box sx={{ mt: 0.75 }}>
            <TextField
              fullWidth
              value={text}
              onChange={(e) => setText(e.target.value)}
              multiline
            />
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Button size="small" variant="contained" color="primary" onClick={save}>
                Save
              </Button>
              <Button
                size="small"
                variant="text"
                onClick={() => {
                  setEditing(false);
                  setText(comment.content);
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="body1" sx={{ mt: 0.25 }}>
            {comment.content}
          </Typography>
        )}
      </Box>
      {isOwner && !editing && (
        <>
          <IconButton size="small" onClick={(e) => setMenuEl(e.currentTarget)}>
            <MoreHorizIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Menu anchorEl={menuEl} open={Boolean(menuEl)} onClose={() => setMenuEl(null)}>
            <MenuItem
              onClick={() => {
                setMenuEl(null);
                setEditing(true);
              }}
            >
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMenuEl(null);
                onDelete(comment.id);
              }}
              sx={{ color: "error.main" }}
            >
              Delete
            </MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
}

export default function PostDetails() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [liked, setLiked] = useState(false);

  // typing indicator — emits on composer keystrokes, shows others' typing
  const { typingUser, notifyTyping, stopTyping } = useTypingIndicator({
    postId,
    currentUserId: currentUser?.userId,
    firstName: currentUser?.firstName,
  });

  const refetchComments = useCallback(() => {
    return axiosInstance
      .get(`/comments/${postId}`)
      .then((r) => setComments(r.data.comments || []))
      .catch(console.error);
  }, [postId]);

  useEffect(() => {
    axiosInstance.get("/auth/me").then((r) => setCurrentUser(r.data.user)).catch(() => {});
    axiosInstance
      .get(`/posts/${postId}`)
      .then((r) => {
        const p = r.data.post || r.data;
        setPost(p);
        setLiked((p.likes?.length || 0) > 0); // likedByMe from optional-auth include
      })
      .catch(console.error)
      .finally(() => setLoadingPost(false));
    refetchComments().finally(() => setLoadingComments(false));
  }, [postId, refetchComments]);

  // live like:updated for THIS post — adopt the server's absolute count
  const onLikeUpdated = useCallback(({ likeCount }) => {
    setPost((prev) =>
      prev ? { ...prev, _count: { ...prev._count, likes: likeCount } } : prev
    );
  }, []);

  // join post room; stream comment + like events while the page is open
  useRealtimeComments({
    postId,
    currentUserId: currentUser?.userId,
    setComments,
    onLikeUpdated,
    refetch: refetchComments,
  });

  const handleLike = async () => {
    if (!post) return;
    const prevLiked = liked;
    const prevCount = post._count?.likes || 0;
    setLiked(!prevLiked);
    onLikeUpdated({ likeCount: prevCount + (prevLiked ? -1 : 1) });
    try {
      const res = await axiosInstance.post(`/likes/toggle/${post.id}`);
      if (res.data?.likeCount !== undefined) {
        setLiked(res.data.liked);
        onLikeUpdated({ likeCount: res.data.likeCount });
      }
    } catch (err) {
      setLiked(prevLiked);
      onLikeUpdated({ likeCount: prevCount });
      console.error("Like failed:", err);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    stopTyping(); // clear the indicator for others immediately
    try {
      setPosting(true);
      const res = await axiosInstance.post(`/comments/create/${postId}`, {
        content: newComment.trim(),
      });
      setComments((prev) => [res.data.comment, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Add comment failed:", err);
    } finally {
      setPosting(false);
    }
  };

  const updateComment = async (commentId, content) => {
    try {
      await axiosInstance.put(`/comments/update/${commentId}`, { content });
      setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, content } : c)));
    } catch (err) {
      console.error("Update comment failed:", err);
      alert("Couldn't update the comment. Try again.");
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await axiosInstance.delete(`/comments/delete/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Delete comment failed:", err);
    }
  };

  if (loadingPost)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress size={24} color="primary" />
      </Box>
    );

  if (!post)
    return (
      <Typography align="center" variant="body1" sx={{ mt: 8 }}>
        Post not found
      </Typography>
    );

  const authorAvatar = getAvatarStyle(post.author?.id);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
          onClick={() => navigate("/")}
          sx={{ px: 1 }}
        >
          Back to feed
        </Button>
      </Box>

      {/* Post */}
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                backgroundColor: authorAvatar.bg,
                color: authorAvatar.color,
              }}
            >
              {post.author?.firstName?.[0]?.toUpperCase() || "U"}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "text.primary" }}>
                {post.author?.firstName} {post.author?.lastName || ""}
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "text.disabled" }}>
                @{post.author?.firstName?.toLowerCase() || "unknown"} ·{" "}
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </Typography>
            </Box>
          </Box>

          <Typography variant="h2" sx={{ mb: 0.75, color: "text.primary" }}>
            {post.title}
          </Typography>
          <Typography variant="body1">{post.content}</Typography>
          {post.imageUrl && (
            <Box
              component="img"
              src={post.imageUrl}
              alt=""
              sx={{ width: "100%", borderRadius: "10px", mt: 1.5, display: "block" }}
            />
          )}

          {/* action row — like count stays live via like:updated */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1.5 }}>
            <Button
              size="small"
              startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              onClick={handleLike}
              sx={{
                color: liked ? "primary.main" : "text.disabled",
                backgroundColor: liked ? "primary.light" : "transparent",
                borderRadius: "8px",
                px: 1,
                "& .MuiButton-startIcon": { mr: 0.5 },
              }}
            >
              {post._count?.likes || 0}
            </Button>
            <Button
              size="small"
              startIcon={<ChatBubbleOutlineIcon />}
              disabled
              sx={{
                color: "text.disabled",
                borderRadius: "8px",
                px: 1,
                "& .MuiButton-startIcon": { mr: 0.5 },
                "&.Mui-disabled": { color: "text.disabled" },
              }}
            >
              {comments.length}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Composer */}
      <Card>
        <CardContent sx={{ display: "flex", gap: 1.5, py: "12px !important" }}>
          <TextField
            fullWidth
            multiline
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => {
              setNewComment(e.target.value);
              notifyTyping();
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={addComment}
            disabled={posting || !newComment.trim()}
            sx={{ alignSelf: "flex-end" }}
          >
            Post
          </Button>
        </CardContent>
      </Card>

      {/* Comments */}
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, px: 0.5 }}>
        <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "text.primary" }}>
          Comments
        </Typography>
        <Typography sx={{ fontSize: "12px", color: "text.disabled" }}>
          {comments.length}
        </Typography>
        {typingUser && (
          <Typography sx={{ fontSize: "12px", color: "primary.main", ml: "auto" }}>
            {typingUser} is typing…
          </Typography>
        )}
      </Box>

      <Card>
        <CardContent sx={{ py: "6px !important" }}>
          {loadingComments ? (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <CircularProgress size={20} color="primary" />
            </Box>
          ) : comments.length === 0 ? (
            <Typography variant="body1" sx={{ py: 2, textAlign: "center" }}>
              No comments yet — start the conversation.
            </Typography>
          ) : (
            comments.map((c, i) => (
              <Box
                key={c.id}
                sx={{ borderTop: i === 0 ? "none" : "0.5px solid", borderColor: "divider" }}
              >
                <CommentItem
                  comment={c}
                  currentUser={currentUser}
                  onUpdate={updateComment}
                  onDelete={deleteComment}
                />
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
