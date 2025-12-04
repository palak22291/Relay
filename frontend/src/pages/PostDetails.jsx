import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  TextField,
  Button,
  IconButton,
  //   Divider,
  CircularProgress,
} from "@mui/material";
import { ArrowBack, Delete as DeleteIcon } from "@mui/icons-material";
import axiosInstance from "../utils/axiosInstance";
import { useParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export default function PostDetails() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");

  // Fetch logged-in user from token decoded endpoint (/auth/me or /user/me)
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    console.log("📌 useEffect triggered! postId =", postId);
    fetchCurrentUser();
    fetchPost();
    fetchComments();
  }, [postId]);

  const fetchCurrentUser = async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      console.log("CURRENT USER:", res.data.user);
      setCurrentUser(res.data.user);
    } catch (err) {
      console.error("❌ Fetch user failed:", err);
    }
  };

  const fetchPost = async () => {
    try {
      const res = await axiosInstance.get(`/posts/${postId}`);
      setPost(res.data.post || res.data);
    } catch (err) {
      console.error("❌ Post fetch error:", err);
    } finally {
      setLoadingPost(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axiosInstance.get(`/comments/${postId}`);
      console.log("COMMENTS:", res.data.comments);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error("❌ Comments fetch error:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await axiosInstance.post(`/comments/create/${postId}`, {
        content: newComment.trim(),
      });

      setComments((prev) => [res.data.comment, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("❌ Add comment error:", err);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    try {
      const res = await axiosInstance.put(`/comments/update/${commentId}`, {
        content: editText.trim(),
      });

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, content: editText.trim() } : c
        )
      );

      setEditingCommentId(null);
      setEditText("");
    } catch (err) {
      console.error("❌ Update comment error:", err);
      alert("Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await axiosInstance.delete(`/comments/delete/${commentId}`);

      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("❌ Delete comment error:", err);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  };

  if (loadingPost)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );

  if (!post)
    return (
      <Typography align="center" sx={{ mt: 8, color: "gray" }}>
        Post not found
      </Typography>
    );

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", p: 2 }}>
      {/* BACK BUTTON */}
      <IconButton onClick={() => navigate("/")} sx={{ mb: 2 }}>
        <ArrowBack sx={{ color: "white" }} />
      </IconButton>

      {comments.map((c) => (
        <Card
          key={c.id}
          sx={{
            background: "rgba(20, 20, 35, 0.85)",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.04)",
            mb: 2,
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  background: "linear-gradient(135deg, #6A00F4, #BB86FC)",
                }}
              >
                {getInitials(c.author?.firstName + " " + c.author?.lastName)}
              </Avatar>

              <Box sx={{ flexGrow: 1 }}>
                <Typography fontWeight={600}>
                  @{c.author?.firstName?.toLowerCase()}
                </Typography>

                <Typography sx={{ color: "gray" }} variant="body2">
                  {formatDistanceToNow(new Date(c.createdAt))} ago
                </Typography>

                {/* 👇 EDIT MODE */}
                {editingCommentId === c.id ? (
                  <>
                    <TextField
                      fullWidth
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      sx={{ mt: 1, input: { color: "white" } }}
                    />

                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleUpdateComment(c.id)}
                      >
                        Save
                      </Button>

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </>
                ) : (
                  /* 👇 NORMAL VIEW */
                  <Typography sx={{ mt: 1 }}>{c.content}</Typography>
                )}
              </Box>

              {/* EDIT + DELETE icons (show ONLY if your comment) */}
              {currentUser?.userId === c.authorId && (
                <Stack direction="row">
                  {/* EDIT button */}
                  {editingCommentId !== c.id && (
                    <Button
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => {
                        setEditingCommentId(c.id);
                        setEditText(c.content);
                      }}
                    >
                      Edit
                    </Button>
                  )}

                  {/* DELETE button */}
                  <IconButton
                    onClick={() => handleDeleteComment(c.id)}
                    size="small"
                  >
                    <DeleteIcon sx={{ color: "error.main" }} />
                  </IconButton>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
