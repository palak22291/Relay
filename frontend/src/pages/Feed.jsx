// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   CircularProgress,
//   Stack,
// } from "@mui/material";
// import axiosInstance from "../utils/axiosInstance";
// import PostCard from "../components/PostCard";

// export default function Feed() {
//   const [posts, setPosts] = useState([]);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [loadMoreLoading, setLoadMoreLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(true);

//   const [currentUser, setCurrentUser] = useState(null);

//   const fetchCurrentUser = async () => {
//     try {
//       const res = await axiosInstance.get("/auth/me");
//       setCurrentUser(res.data.user);
//     } catch (err) {
//       console.error("❌ Failed to fetch user:", err);
//     }
//   };

//   const fetchPosts = async (pageNumber = 1) => {
//     try {
//       if (pageNumber === 1) setLoading(true);
//       else setLoadMoreLoading(true);

//       const res = await axiosInstance.get(`/posts?limit=5&page=${pageNumber}`);
//       const newPosts = res.data.posts || [];

//       if (pageNumber === 1) {
//         setPosts(newPosts);
//       } else {
//         setPosts((prev) => [...prev, ...newPosts]);
//       }

//       if (newPosts.length < 5) {
//         setHasMore(false);
//       }
//     } catch (err) {
//       console.error("❌ Fetch posts failed:", err);
//     } finally {
//       setLoading(false);
//       setLoadMoreLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCurrentUser();
//     fetchPosts(1);
//   }, []);

//   const handleDeletePost = (postId) => {
//     setPosts((prev) => prev.filter((p) => p.id !== postId));
//   };

//   return (
//     <Box sx={{ px: 2, py: 3 }}>
//       <Typography
//         variant="h4"
//         fontWeight={800}
//         sx={{
//           mb: 4,
//           background: "linear-gradient(90deg, #6A00F4, #BB86FC)",
//           WebkitBackgroundClip: "text",
//           WebkitTextFillColor: "transparent",
//         }}
//       >
//         Connectify Feed
//       </Typography>

//       {/* first time loading when user load the site  */}
//       {loading ? (
//         <Box sx={{ textAlign: "center", mt: 4 }}>
//           <CircularProgress />
//         </Box>
//       ) : posts.length === 0 ? (
//         <Typography sx={{ textAlign: "center", mt: 4, color: "gray" }}>
//           No posts yet.
//         </Typography>
//       ) : (
//         <Stack spacing={3}>
//           {posts.map((post) => (
//             <PostCard
//               key={post.id}
//               post={post}
//               onDelete={handleDeletePost}
//               user={
//                 currentUser
//                   ? { id: currentUser.userId, email: currentUser.email }
//                   : null
//               }
//             />
//           ))}
//         </Stack>
//       )}

//       {/* if our feed has more than 5 posts then we will show load more button  */}
//       {!loading && hasMore && (
//         <Box sx={{ textAlign: "center", mt: 3 }}>
//           <Button
//             variant="contained"
//             onClick={() => {
//               const nextPage = page + 1;
//               setPage(nextPage);
//               fetchPosts(nextPage);
//             }}
//             disabled={loadMoreLoading}
//           >
//             {loadMoreLoading ? "Loading..." : "Load More"}
//           </Button>
//         </Box>
//       )}
//     </Box>
//   );
// }



import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
  TextField,
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

  // ⭐ SEARCH STATES
  const [typedSearch, setTypedSearch] = useState("");
  const [search, setSearch] = useState("");

  const fetchCurrentUser = async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      setCurrentUser(res.data.user);
    } catch (err) {
      console.error("❌ Failed to fetch user:", err);
    }
  };

  const fetchPosts = async (pageNumber = 1, searchValue = "") => {
    try {
      if (pageNumber === 1) setLoading(true);
      else setLoadMoreLoading(true);

      const res = await axiosInstance.get(
        `/posts?limit=5&page=${pageNumber}&search=${searchValue}`
      );

      const newPosts = res.data.posts || [];

      if (pageNumber === 1) {
        setPosts(newPosts); // fresh list when searching or new page 1
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

  useEffect(() => {
    fetchCurrentUser();
    fetchPosts(1, search); // fetch with search applied
  }, [search]);

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

      {/* 🔍 SEARCH BAR */}
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
            fetchPosts(1, typedSearch);
          }
        }}
        sx={{
          mb: 3,
          input: { color: "white" },
        }}
      />

      {/* first time loading */}
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


      {!loading && hasMore && (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Button
            variant="contained"
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              fetchPosts(nextPage, search); 
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
