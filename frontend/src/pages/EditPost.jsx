
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";

export default function EditPost() {
  const { postId } = useParams(); 
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch existing post ONCE on mount
  useEffect(() => {
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const fetchPost = async () => {
    try {
      const res = await axiosInstance.get(`/posts/${postId}`);
      // backend may return post directly or { post: {...} }
      const fetched = res.data.post || res.data;
      if (!fetched) {
        throw new Error("Post not found from API");
      }

      // Prefill form fields with existing values
      setTitle(fetched.title || "");
      setContent(fetched.content || "");
      setImageUrl(fetched.imageUrl || "");
    } catch (err) {
      console.error("❌ Failed to fetch post for edit:", err);
      alert("Failed to load post for editing.");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const payload = {
        title,
        content,
        imageUrl,
      };

      const res = await axiosInstance.put(`/posts/${postId}`, payload);
      if (res.status === 200 || res.status === 201) {
        // success -> go to post detail or feed
        navigate(`/post/${postId}`);
      } else {
        console.error("Unexpected update response:", res);
        alert("Failed to update post");
      }
    } catch (err) {
      console.error("❌ Update failed:", err?.response?.data || err);
      alert(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to update post."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 5, px: 2 }}>
      <Card
        sx={{
          background: "rgba(30, 30, 50, 0.85)",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <CardContent>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
            Edit Post
          </Typography>

          <form onSubmit={handleSave}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                InputLabelProps={{ style: { color: "#bbb" } }}
                inputProps={{ style: { color: "white" } }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                InputLabelProps={{ style: { color: "#bbb" } }}
                inputProps={{ style: { color: "white" } }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Image URL (optional)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                InputLabelProps={{ style: { color: "#bbb" } }}
                inputProps={{ style: { color: "white" } }}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={saving}
              sx={{ mt: 1 }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
