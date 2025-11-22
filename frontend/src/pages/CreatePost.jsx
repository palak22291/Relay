import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Stack,
  Alert,
} from "@mui/material";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState(null);
  const [severity, setSeverity] = useState("info");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setMessage(null);

    // simple frontend validation
    if (!title.trim() || !content.trim()) {
      setSeverity("error");
      setMessage("Title and content are required.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setSeverity("error");
      setMessage("You must be logged in to create a post.");
      return;
    }

    try {
      setLoading(true);

      const res = await axiosInstance.post(
        "/posts",
        {
          title: title.trim(),
          content: content.trim(),
          imageUrl: imageUrl.trim() || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSeverity("success");
      setMessage(res.data?.message || "Post created successfully!");

      // clear form
      setTitle("");
      setContent("");
      setImageUrl("");

      // small delay then go back to feed
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      console.error("❌ Create post error:", err?.response || err);
      setSeverity("error");
      setMessage(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to create post. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0d0d16, #1a0033)",
        p: 3,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 600,
          background: "rgba(30, 30, 50, 0.85)",
          backdropFilter: "blur(8px)",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            fontWeight={700}
            align="center"
            gutterBottom
            sx={{
              background: "linear-gradient(90deg, #6A00F4, #BB86FC)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Create a Post
          </Typography>

          {message && (
            <Alert severity={severity} sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <Stack spacing={2}>
            <TextField
              label="Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <TextField
              label="Content"
              fullWidth
              multiline
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <TextField
              label="Image URL (optional)"
              fullWidth
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />

            <Button
              variant="contained"
              sx={{ textTransform: "none", mt: 1 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Publishing..." : "Publish Post"}
            </Button>

            <Button
              variant="text"
              sx={{ textTransform: "none" }}
              onClick={() => navigate("/")}
            >
              ← Back to Feed
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
