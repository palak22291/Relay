// import React, {  useState } from "react";
// import {
//   Card,
//   CardContent,
//   Typography,
//   Box,
//   Button,
//   IconButton,
//   // TextField,
// } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// // import EditIcon from "@mui/icons-material/Edit";
// import axiosInstance from "../utils/axiosInstance";
// import { useNavigate } from "react-router-dom";

// export default function PostCard({ post, onDelete, user }) {
//   const navigate = useNavigate();

//   const [deleting, setDeleting] = useState(false);

//   const handleDeletePost = async () => {
//     if (!window.confirm("Are you sure you want to delete this post?")) return;

//     try {
//       setDeleting(true);
//       const res = await axiosInstance.delete(`/posts/${post.id}`);

//       if (res.status === 200) {
//         if (typeof onDelete === "function") onDelete(post.id);
//       } else {
//         alert("Failed to delete post");
//       }
//     } catch (err) {
//       console.error("❌ Delete post error:", err);
//       alert("Failed to delete post");
//     } finally {
//       setDeleting(false);
//     }
//   };

//   return (
//     <Card
//       sx={{
//         background: "rgba(30, 30, 50, 0.85)",
//         backdropFilter: "blur(8px)",
//         borderRadius: 3,
//         border: "1px solid rgba(255,255,255,0.05)",
//         mb: 3,
//       }}
//     >
//       <CardContent>
//         {/* AUTHOR */}
//         <Typography variant="subtitle2" sx={{ color: "#BB86FC", mb: 1 }}>
//           @{post.author?.firstName || "Unknown"}
//         </Typography>

//         {/* TITLE */}
//         <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
//           {post.title}
//         </Typography>

//         {/* CONTENT */}
//         <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
//           {post.content}
//         </Typography>

   
//         <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
   
//           <Button variant="contained" size="small">
//             Like ({post._count?.likes || 0})
//           </Button>

//           {/* COMMENTS COUNT BTN */}
//           <Button
//             variant="outlined"
//             size="small"
//             onClick={() => navigate(`/post/${post.id}`)}
//           >
//             Comments ({post._count?.comments || 0})
//           </Button>

//           <Box sx={{ flex: 1 }} />

//           {/* EDIT + DELETE BUTTONS (ONLY IF OWNER) */}
//           {user?.id === post.author?.id && (
//             <>
//               <Button
//                 variant="outlined"
//                 size="small"
//                 onClick={() => navigate(`/edit/${post.id}`)}
//               >
//                 Edit
//               </Button>

//               <IconButton onClick={handleDeletePost} disabled={deleting}>
//                 <DeleteIcon sx={{ color: "error.main" }} />
//               </IconButton>
//             </> 
//           )}
//         </Box>
      

       

         
//       </CardContent>
//     </Card>
//   );
// }


import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function PostCard({ post, onDelete, user }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      setDeleting(true);
      const res = await axiosInstance.delete(`/posts/${post.id}`);

      if (res.status === 200) {
        if (typeof onDelete === "function") onDelete(post.id);
      } else {
        alert("Failed to delete post");
      }
    } catch (err) {
      console.error("❌ Delete post error:", err);
      alert("Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card
      sx={{
        // background:
        //   "linear-gradient(180deg, rgba(32,32,50,0.95), rgba(20,20,35,0.95))",
        backdropFilter: "blur(10px)",
        borderRadius: 2.5,
        border: "1px solid rgba(255,255,255,0.08)",
        mb: 3,
        boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease",

        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 8px 20px rgba(141, 80, 255, 0.2)",
          border: "1.5px solid rgba(180,120,255,0.2)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* AUTHOR */}
        <Typography
          variant="caption"
          sx={{
            color: "#BB86FC",
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          @{post.author?.firstName || "Unknown"}
        </Typography>

        {/* TITLE */}
        <Typography
          variant="h6"
          sx={{
            mt: 1,
            mb: 1,
            fontWeight: 700,
            color: "#F3EFFF",
            lineHeight: 1.3,
          }}
        >
          {post.title}
        </Typography>

        {/* CONTENT */}
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255,255,255,0.75)",
            mb: 2,
            lineHeight: 1.6,
          }}
        >
          {post.content}
        </Typography>

        <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.08)" }} />

        {/* ACTION ROW */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            size="small"
            sx={{
              background:
                "linear-gradient(135deg, #6A00F4, #BB86FC)",
              textTransform: "none",
              fontWeight: 600,
              px: 2,
              "&:hover": {
                background:
                  "linear-gradient(135deg, #7B1FFF, #C49BFF)",
              },
            }}
          >
            Like ({post._count?.likes || 0})
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate(`/post/${post.id}`)}
            sx={{
              textTransform: "none",
              borderColor: "rgba(187,134,252,0.5)",
              color: "#BB86FC",
              "&:hover": {
                borderColor: "#BB86FC",
                background: "rgba(187,134,252,0.1)",
              },
            }}
          >
            Comments ({post._count?.comments || 0})
          </Button>

          <Box sx={{ flex: 1 }} />

          {/* EDIT + DELETE */}
          {user?.id === post.author?.id && (
            <>
              <Button
                variant="text"
                size="small"
                onClick={() => navigate(`/edit/${post.id}`)}
                sx={{
                  color: "#BB86FC",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    background: "rgba(187,134,252,0.12)",
                  },
                }}
              >
                Edit
              </Button>

              <IconButton
                onClick={handleDeletePost}
                disabled={deleting}
                sx={{
                  color: "#ff6b6b",
                  "&:hover": {
                    background: "rgba(255,80,80,0.15)",
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

