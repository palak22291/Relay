

// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Avatar,
//   Stack,
//   Button,
//   IconButton,
//   Divider,
// } from "@mui/material";
// import axiosInstance from "../utils/axiosInstance";
// import { formatDistanceToNow } from "date-fns";
// import { Heart, MessageCircle } from "lucide-react"; 
// import { useNavigate } from "react-router-dom";
// import PostCard from "../components/PostCard";

// export default function Feed() {
//   const [posts, setPosts] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchPosts();
//   }, []);

//   const fetchPosts = async () => {
//     try {
//       const res = await axiosInstance.get("/posts?limit=20&page=1");
//       setPosts(res.data.posts || []);
//     } catch (err) {
//       console.error("❌ Fetch posts failed:", err);
//     }
//   };

//   // Utility function to create initials avatar
//   const getInitials = (name) => {
//     if (!name) return "U";
//     const parts = name.trim().split(" ");
//     if (parts.length === 1) return parts[0][0].toUpperCase();
//     return (parts[0][0] + parts[1][0]).toUpperCase();
//   };

//   const handleDeletePost=(postId)=>{
//     setPosts((prev) => prev.filter((p) => p.id !== postId))




//   }

//   return (
//     <Box>
//       {posts.length === 0 ? (
//         <Typography align="center" sx={{ mt: 8, color: "gray" }}>
//           No posts yet — start following people.
//         </Typography>
//       ) : (
//         posts.map((post) => (
//           <PostCard
//             key={post.id}
//             post={post}
//             onDelete={handleDeletePost}
//             user={{id:1}}
//             sx={{
//               mb: 3,
//               p: 2,
//               background: "rgba(20, 20, 35, 0.65)",
//               border: "1px solid rgba(255,255,255,0.07)",
//               borderRadius: 3,
//               backdropFilter: "blur(8px)",
//               transition: "0.25s ease",
//               boxShadow: "0 0 15px rgba(0,0,0,0.25)",
//               "&:hover": {
//                 border: "1px solid rgba(186, 104, 255, 0.4)",
//                 boxShadow: "0 0 20px rgba(120, 50, 200, 0.25)",
//               },
//             }}
//           >
//             <CardContent>
              
//               <Stack direction="row" alignItems="center" spacing={2} mb={2}>
//                 <Avatar
//                   sx={{
//                     width: 46,
//                     height: 46,
//                     borderRadius: 2,
//                     background: "linear-gradient(135deg, #6A00F4, #BB86FC)",
//                     fontWeight: 700,
//                   }}
//                 >
//                   {getInitials(post.author?.firstName + " " + post.author?.lastName)}
//                 </Avatar>

//                 <Box>
//                   <Typography fontWeight={600}>
//                     @{post.author?.firstName?.toLowerCase() || "user"}
//                   </Typography>

//                   <Typography variant="body2" sx={{ color: "gray" }}>
//                     {formatDistanceToNow(new Date(post.createdAt))} ago
//                   </Typography>
//                 </Box>
//               </Stack>

      
//               <Typography
//                 variant="h6"
//                 fontWeight={700}
//                 sx={{ mb: 1, color: "#E0E0E0" }}
//               >
//                 {post.title}
//               </Typography>

   
//               {post.imageUrl && (
//                 <Box
//                   sx={{
//                     mt: 2,
//                     mb: 2,
//                     borderRadius: 3,
//                     overflow: "hidden",
//                     background: "rgba(255,255,255,0.05)",
//                     boxShadow: "0 0 12px rgba(130, 60, 220, 0.25)",
//                     border: "1px solid rgba(255,255,255,0.08)",
//                   }}
//                 >
//                   <img
//                     src={post.imageUrl}
//                     alt="post"
//                     style={{
//                       width: "100%",
//                       maxHeight: "350px",
//                       objectFit: "cover",
//                     }}
//                   />
//                 </Box>
//               )}

            
//               <Typography sx={{ mb: 2, color: "#cfcfcf" }}>
//                 {post.content}
//               </Typography>

//               <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.06)" }} />

         
//               <Stack direction="row" spacing={3}>
//                 <IconButton color="inherit">
//                   <Heart size={22} />
//                 </IconButton>

//                 <IconButton color="inherit">
//                   <MessageCircle size={22} />
//                 </IconButton>
//               </Stack>
//             </CardContent>
//           </PostCard>
//         ))
//       )}
//     </Box>
//   );
// }

import React, { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress, Stack } from "@mui/material";
import axiosInstance from "../utils/axiosInstance";
import PostCard from "../components/PostCard";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [currentUser, setCurrentUser] = useState(null);

  // ------------------------------
  // FETCH LOGGED-IN USER
  // ------------------------------
  const fetchCurrentUser = async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      setCurrentUser(res.data.user);
    } catch (err) {
      console.error("❌ Failed to fetch user:", err);
    }
  };

  // ------------------------------
  // FETCH POSTS
  // ------------------------------
  const fetchPosts = async (pageNumber = 1) => {
    try {
      if (pageNumber === 1) setLoading(true);
      else setLoadMoreLoading(true);

      const res = await axiosInstance.get(`/posts?limit=5&page=${pageNumber}`);
      const newPosts = res.data.posts || [];

      if (pageNumber === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      if (newPosts.length < 5) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("❌ Fetch posts failed:", err);
    } finally {
      setLoading(false);
      setLoadMoreLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchPosts(1);
  }, []);

  // ------------------------------
  // DELETE POST HANDLER
  // ------------------------------
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

      {/* FIRST TIME LOADER */}
      {loading ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : posts.length === 0 ? (
        <Typography sx={{ textAlign: "center", mt: 4, color: "gray" }}>
          No posts yet.
        </Typography>
      ) : (
        <Stack spacing={3}>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handleDeletePost}
              user={currentUser}  // IMPORTANT
            />
          ))}
        </Stack>
      )}

      {/* LOAD MORE */}
      {!loading && hasMore && (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Button
            variant="contained"
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              fetchPosts(nextPage);
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
