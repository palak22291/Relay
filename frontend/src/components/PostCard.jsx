import React from "react";
import { Card, CardContent, Typography, Box, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import axiosInstance from "../utils/axiosInstance";

export default function PostCard({ post,ondelete,user }) {
  const handleDelete = async () => {
    try {
      const res = await axiosInstance.delete(`/posts/${post.id}`);
      if (res.status == 200) {
        alert("Post Deleted Sucessfully");
        ondelete(post.id);
        // ondelete will be created inside feed.jsx as post card is a child component and feed.jsx is parent
      }
    } catch (err) {
      console.error("DeleteError:", err.response?.data || err);
      alert("Failed to delete post");
    }
  };

  return (
    <Card
      sx={{
        background: "rgba(30, 30, 50, 0.85)",
        backdropFilter: "blur(8px)",
        borderRadius: 3,
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" sx={{ color: "#BB86FC", mb: 1 }}>
          @{post.author?.firstName || "Unknown"}
        </Typography>

        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
          {post.title}
        </Typography>

        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          {post.content}
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="contained" size="small">
            Like ({post._count?.likes || 0})
          </Button>
          <Button variant="outlined" size="small">
            Comments ({post._count?.comments || 0})
          </Button>

          {/* delete button  */}

          {user?.id === post.author?.id && (
            // optional chaining and short circuit conditional rendering 
            <DeleteIcon
              onClick={handleDelete}
              style={{ cursor: "pointer", color: "red", marginLeft: "auto" }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
