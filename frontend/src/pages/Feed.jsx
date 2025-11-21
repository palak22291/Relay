import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Stack ,Button} from "@mui/material";
import axiosInstance from "../utils/axiosInstance";
import PostCard from "../components/PostCard";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axiosInstance.get("/posts?limit=10&page=1");
      setPosts(res.data.posts);
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: 3,
        py: 5,
        background: "linear-gradient(135deg, #0d0d16, #1a0033)",
      }}
    >
      {/* PAGE TITLE */}
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{
          mb: 4,
          background: "linear-gradient(90deg, #6A00F4, #BB86FC)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Connectify Feed
      </Typography>
      {/* button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
        <Button
          variant="contained"
          onClick={() => (window.location.href = "/create")}
          sx={{ textTransform: "none" }}
        >
          + Create Post
        </Button>
      </Box>

      {/* LOADER */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3}>
          {posts?.length ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <Typography sx={{ color: "text.secondary" }}>
              No posts yet. Start following people!
            </Typography>
          )}
        </Stack>
      )}
    </Box>
  );
}
