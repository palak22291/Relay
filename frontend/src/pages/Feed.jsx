// src/pages/Feed.jsx
import React, { useEffect, useState, useCallback } from "react";
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
import { useRealtimeFeed } from "../hooks/useRealtimeFeed";
import { useCurrentUser } from "../context/CurrentUserContext";

// append while deduping by id — live prepends can shift offset pages, so
// "load more" may return posts we already have
const mergeById = (prev, incoming) => {
  const ids = new Set(prev.map((p) => p.id));
  return [...prev, ...incoming.filter((p) => !ids.has(p.id))];
};

export default function Feed() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { currentUser } = useCurrentUser();

  const [typedSearch, setTypedSearch] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | mostCommented

  // pagination state — cursor for the live feed, page for filtered views
  const [nextCursor, setNextCursor] = useState(null);
  const [page, setPage] = useState(1);

  // posts delivered by the socket wait here until the pill is clicked
  const [queuedPosts, setQueuedPosts] = useState([]);

  // Default view = cursor pagination on /posts/feed (correct under live
  // prepends). Search/sort views use the offset endpoint, which supports
  // those filters — live prepends don't apply to filtered views anyway.
  const isDefaultView = sortBy === "newest" && search === "";

  const fetchFirstPage = useCallback(async () => {
    try {
      setLoading(true);
      setQueuedPosts([]); // fresh page 1 already contains anything queued
      if (isDefaultView) {
        const res = await axiosInstance.get("/posts/feed?limit=5");
        setPosts(res.data.posts || []);
        setNextCursor(res.data.nextCursor || null);
        setHasMore(Boolean(res.data.nextCursor));
      } else {
        const res = await axiosInstance.get(
          `/posts?limit=5&page=1&search=${encodeURIComponent(search)}&sortBy=${sortBy}`
        );
        const newPosts = res.data.posts || [];
        setPosts(newPosts);
        setHasMore(newPosts.length === 5);
      }
      setPage(1);
      setLoadError(false);
    } catch (err) {
      // surface it — a failed fetch must not render as "No posts yet"
      console.error("Fetch posts failed:", err);
      setLoadError(true);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [isDefaultView, search, sortBy]);

  const loadMore = useCallback(async () => {
    try {
      setLoadMoreLoading(true);
      if (isDefaultView) {
        if (!nextCursor) return;
        const res = await axiosInstance.get(
          `/posts/feed?limit=5&cursor=${encodeURIComponent(nextCursor)}`
        );
        setPosts((prev) => mergeById(prev, res.data.posts || []));
        setNextCursor(res.data.nextCursor || null);
        setHasMore(Boolean(res.data.nextCursor));
      } else {
        const next = page + 1;
        const res = await axiosInstance.get(
          `/posts?limit=5&page=${next}&search=${encodeURIComponent(search)}&sortBy=${sortBy}`
        );
        const newPosts = res.data.posts || [];
        setPosts((prev) => mergeById(prev, newPosts));
        setPage(next);
        setHasMore(newPosts.length === 5);
      }
    } catch (err) {
      console.error("Load more failed:", err);
    } finally {
      setLoadMoreLoading(false);
    }
  }, [isDefaultView, nextCursor, page, search, sortBy]);

  useEffect(() => {
    fetchFirstPage();
  }, [fetchFirstPage]);

  // live events: post:new → pill queue, post:deleted → drop, like:updated → patch
  useRealtimeFeed({
    currentUserId: currentUser?.userId,
    setPosts,
    setQueuedPosts,
    refetch: fetchFirstPage,
  });

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

      {/* New posts pill — shown when sockets queue live posts */}
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
      ) : loadError && posts.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "text.primary" }}>
            Couldn't load the feed
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Check your connection, then try again.
          </Typography>
          <Button variant="outlined" onClick={fetchFirstPage}>
            Retry
          </Button>
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
        <Button variant="outlined" fullWidth onClick={loadMore} disabled={loadMoreLoading} sx={{ mt: 1 }}>
          {loadMoreLoading ? "Loading…" : "Load more"}
        </Button>
      )}
    </Box>
  );
}
