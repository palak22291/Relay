// src/pages/Feed.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  Card,
  CardContent,
  Avatar,
  Chip,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import PostCard from "../components/PostCard";
import { getAvatarStyle } from "../utils/ui";

export default function Feed() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [typedSearch, setTypedSearch] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | mostCommented

  // Real-time hook point: socket "post:new" events push here instead of
  // yanking the scroll position. The pill flushes them on click.
  const [queuedPosts, setQueuedPosts] = useState([]);

  const fetchCurrentUser = async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      setCurrentUser(res.data.user);
    } catch {
      setCurrentUser(null);
    }
  };

  const fetchPosts = async (pageNumber = 1, searchValue = search, sortValue = sortBy) => {
    try {
      pageNumber === 1 ? setLoading(true) : setLoadMoreLoading(true);

      const res = await axiosInstance.get(
        `/posts?limit=5&page=${pageNumber}&search=${encodeURIComponent(searchValue)}&sortBy=${sortValue}`
      );

      const newPosts = res.data.posts || [];
      setPosts((prev) => (pageNumber === 1 ? newPosts : [...prev, ...newPosts]));
      setHasMore(newPosts.length === 5);
    } catch (err) {
      console.error("Fetch posts failed:", err);
    } finally {
      setLoading(false);
      setLoadMoreLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchPosts(1, search, sortBy);
  }, [search, sortBy]);

  const flushQueue = () => {
    setPosts((prev) => {
      const ids = new Set(prev.map((p) => p.id));
      const fresh = queuedPosts.filter((p) => !ids.has(p.id));
      return [...fresh, ...prev];
    });
    setQueuedPosts([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const composerAvatar = getAvatarStyle(currentUser?.userId);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Compose bar — not a full create page, just a teaser */}
      <Card>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 1.5, py: "12px !important" }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              backgroundColor: composerAvatar.bg,
              color: composerAvatar.color,
            }}
          >
            {currentUser?.firstName?.[0]?.toUpperCase() || "U"}
          </Avatar>
          <Typography
            sx={{ flex: 1, color: "text.disabled", fontSize: "14px", cursor: "pointer" }}
            onClick={() => navigate("/create")}
          >
            What's on your mind{currentUser?.firstName ? `, ${currentUser.firstName}` : ""}?
          </Typography>
        </CardContent>
      </Card>

      {/* New posts pill — shown when socket delivers new posts */}
      {queuedPosts.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Chip
            icon={<ArrowUpwardIcon sx={{ fontSize: 14, color: "primary.contrastText" }} />}
            label={`${queuedPosts.length} new ${queuedPosts.length === 1 ? "post" : "posts"}`}
            onClick={flushQueue}
            sx={{
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 500,
              fontSize: "13px",
              height: 36,
              cursor: "pointer",
              "&:hover": { backgroundColor: "primary.dark" },
            }}
          />
        </Box>
      )}

      {/* Sort + search row */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <TextField
          placeholder="Search posts..."
          size="small"
          sx={{ flex: 1 }}
          value={typedSearch}
          onChange={(e) => setTypedSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setSearch(typedSearch);
          }}
        />
        <Select
          size="small"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          sx={{ minWidth: 140, fontSize: "13px" }}
        >
          <MenuItem value="newest">Newest first</MenuItem>
          <MenuItem value="oldest">Oldest first</MenuItem>
          <MenuItem value="mostCommented">Most comments</MenuItem>
        </Select>
      </Box>

      {/* Post cards */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress size={24} color="primary" />
        </Box>
      ) : posts.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "text.primary" }}>
            No posts yet
          </Typography>
          <Typography variant="body2">Be the first — create a post.</Typography>
        </Box>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
            user={currentUser ? { id: currentUser.userId, email: currentUser.email } : null}
          />
        ))
      )}

      {/* Load more */}
      {!loading && hasMore && posts.length > 0 && (
        <Button
          variant="outlined"
          fullWidth
          onClick={() => {
            const next = page + 1;
            setPage(next);
            fetchPosts(next, search, sortBy);
          }}
          disabled={loadMoreLoading}
          sx={{ mt: 1 }}
        >
          {loadMoreLoading ? "Loading…" : "Load more"}
        </Button>
      )}
    </Box>
  );
}
