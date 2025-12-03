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

  // Fetch logged-in user from token decoded endpoint (/auth/me or /user/me)
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchPost();
    fetchComments();
  },[postId]);

  const fetchCurrentUser = async () => {
    try {
      const res = await axiosInstance.get("/auth/me"); 
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
    return parts.map((p) => p[0]).join("").toUpperCase();
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

      {/* POST CARD */}
      <Card
        sx={{
          background: "rgba(30, 30, 50, 0.85)",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.05)",
          mb: 4,
        }}
      >
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Avatar
              sx={{
                width: 46,
                height: 46,
                background: "linear-gradient(135deg, #6A00F4, #BB86FC)",
              }}
            >
              {getInitials(
                post.author?.firstName + " " + post.author?.lastName
              )}
            </Avatar>

            <Box>
              <Typography fontWeight={600}>
                @{post.author?.firstName?.toLowerCase()}
              </Typography>

              <Typography sx={{ color: "gray" }} variant="body2">
                {formatDistanceToNow(new Date(post.createdAt))} ago
              </Typography>
            </Box>
          </Stack>

          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
            {post.title}
          </Typography>

          <Typography sx={{ mb: 2 }}>{post.content}</Typography>

          {post.imageUrl && (
            <Box
              sx={{
                mt: 2,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <img
                src={post.imageUrl}
                alt="Post"
                style={{ width: "100%", borderRadius: "8px" }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ADD COMMENT INPUT */}
      <Card
        sx={{
          background: "rgba(25, 25, 40, 0.85)",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.04)",
          mb: 3,
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add a Comment
          </Typography>

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Write your comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{
                input: { color: "white" },
              }}
            />
            <Button variant="contained" onClick={handleAddComment}>
              Post
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* COMMENTS LIST */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Comments
      </Typography>

      {loadingComments ? (
        <CircularProgress />
      ) : comments.length === 0 ? (
        <Typography sx={{ color: "gray" }}>No comments yet.</Typography>
      ) : (
        comments.map((c) => (
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

                  <Typography sx={{ mt: 1 }}>{c.content}</Typography>
                </Box>

               
                {currentUser?.id === c.author?.id && (
                  <IconButton
                    onClick={() => handleDeleteComment(c.id)}
                    size="small"
                  >
                    <DeleteIcon sx={{ color: "error.main" }} />
                  </IconButton>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}
