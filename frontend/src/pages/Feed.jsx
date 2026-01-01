import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import axiosInstance from "../utils/axiosInstance";
import PostCard from "../components/PostCard";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [currentUser, setCurrentUser] = useState(null);

 
  const [typedSearch, setTypedSearch] = useState("");
  const [search, setSearch] = useState("");

 
  const [sortBy, setSortBy] = useState("newest"); 
  // newest | oldest | mostCommented

  const fetchCurrentUser = async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      setCurrentUser(res.data.user);
    } catch (err) {
      console.error("❌ Failed to fetch user:", err);
    }
  };


  const fetchPosts = async (pageNumber = 1, searchValue = search, sortValue = sortBy) => {
    try {
      if (pageNumber === 1) setLoading(true);
      else setLoadMoreLoading(true);

      // convert sorting → backend expected values
      let backendSort = "desc"; // default newest
      if (sortValue === "oldest") backendSort = "asc";
      else if (sortValue === "mostCommented") backendSort = "mostCommented";

      const res = await axiosInstance.get(
        `/posts?limit=5&page=${pageNumber}&search=${searchValue}&sortBy=${backendSort}`
      );

      const newPosts = res.data.posts || [];

      if (pageNumber === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === 5);
    } catch (err) {
      console.error("❌ Fetch posts failed:", err);
    } finally {
      setLoading(false);
      setLoadMoreLoading(false);
    }
  };

  // trigger fetch on search or sort change
  useEffect(() => {
    fetchCurrentUser();
    fetchPosts(1, search, sortBy);
  }, [search, sortBy]);

  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <Box sx={{ px: 2, py: 3 }}>
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

     
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        
        {/* SEARCH */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search posts..."
          value={typedSearch}
          onChange={(e) => setTypedSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setSearch(typedSearch);
              setPage(1);
              fetchPosts(1, typedSearch, sortBy);
            }
          }}
          sx={{ input: { color: "white" } }}
        />

        {/* SORTING DROPDOWN */}
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel sx={{ color: "white" }}>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
              fetchPosts(1, search, e.target.value);
            }}
            sx={{
              color: "white",
              ".MuiSvgIcon-root": { color: "white" },
            }}
          >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
            <MenuItem value="mostCommented">Most Commented</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* LOADING STATE */}
      {loading ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : posts.length === 0 ? (
        <Typography sx={{ textAlign: "center", mt: 4, color: "gray" }}>
          No posts found.
        </Typography>
      ) : (
        <Stack spacing={3}>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handleDeletePost}
              user={
                currentUser
                  ? { id: currentUser.userId, email: currentUser.email }
                  : null
              }
            />
          ))}
        </Stack>
      )}

      {/* LOAD MORE BUTTON */}
      {!loading && hasMore && (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Button
            variant="contained"
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              fetchPosts(nextPage, search, sortBy);
            }}
            disabled={loadMoreLoading}
          >
            {loadMoreLoading ? "Loading..." : "Load More"}
          </Button>
        </Box>
      )}
    </Box>
  );
}

