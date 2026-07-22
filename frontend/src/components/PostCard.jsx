// src/components/PostCard.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import axiosInstance from "../utils/axiosInstance";
import { getAvatarStyle } from "../utils/ui";

export default function PostCard({ post, onDelete, user }) {
  const navigate = useNavigate();
  const isOwner = user?.id === post.author?.id;

  // Optimistic like state — post.likes holds only the current user's like
  const [liked, setLiked] = useState((post.likes?.length || 0) > 0);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  const [menuEl, setMenuEl] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // live like:updated events patch post._count.likes in the feed state —
  // adopt the server's absolute count. `liked` stays local: it tracks THIS
  // user's heart, which socket counts say nothing about.
  useEffect(() => {
    setLikeCount(post._count?.likes || 0);
  }, [post._count?.likes]);

  const handleLike = async () => {
    if (!user) return navigate("/login");
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevCount + (prevLiked ? -1 : 1));
    try {
      const res = await axiosInstance.post(`/likes/toggle/${post.id}`);
      if (res.data?.likeCount !== undefined) {
        setLiked(res.data.liked);
        setLikeCount(res.data.likeCount);
      }
    } catch (err) {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      console.error("Like failed:", err);
    }
  };

  const handleDelete = async () => {
    setMenuEl(null);
    if (!window.confirm("Delete this post?")) return;
    try {
      setDeleting(true);
      await axiosInstance.delete(`/posts/${post.id}`);
      onDelete?.(post.id);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Couldn't delete the post. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  const avatarStyle = getAvatarStyle(post.author?.id);

  const openPost = () => navigate(`/post/${post.id}`);

  return (
    <Card sx={{ mb: 0 }}>
      {/* Header + body open the post for ANYONE (ownership only gates the
          edit/delete menu below). The action row is a sibling, so like /
          comment / share never trigger navigation. */}
      <CardContent
        onClick={openPost}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPost();
          }
        }}
        role="link"
        tabIndex={0}
        aria-label={`Open post: ${post.title}`}
        sx={{
          pb: 0,
          cursor: "pointer",
          "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: "-2px" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              backgroundColor: avatarStyle.bg,
              color: avatarStyle.color,
            }}
          >
            {post.author?.firstName?.[0]?.toUpperCase() || "U"}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "text.primary" }} noWrap>
              {post.author?.firstName} {post.author?.lastName || ""}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "text.disabled" }} noWrap>
              @{post.author?.firstName?.toLowerCase() || "unknown"} ·{" "}
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </Typography>
          </Box>
          {/* owner-only: edit/delete. Every handler stops propagation so it
              never also triggers the card's open-post click (MUI renders the
              Menu in a portal, but React events still bubble up the tree). */}
          {isOwner && (
            <>
              <IconButton
                size="small"
                aria-label="post options"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuEl(e.currentTarget);
                }}
              >
                <MoreHorizIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <Menu
                anchorEl={menuEl}
                open={Boolean(menuEl)}
                onClose={() => setMenuEl(null)}
                onClick={(e) => e.stopPropagation()}
              >
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/edit/${post.id}`);
                  }}
                >
                  Edit
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={deleting}
                  sx={{ color: "error.main" }}
                >
                  Delete
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>

        {/* Title — this is the money line, give it weight */}
        <Typography variant="h3" sx={{ mb: 0.75, color: "text.primary" }}>
          {post.title}
        </Typography>

        {/* Body — muted, readable */}
        <Typography
          variant="body1"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 1.5,
          }}
        >
          {post.content}
        </Typography>

        {post.imageUrl && (
          <Box
            component="img"
            src={post.imageUrl}
            alt=""
            sx={{
              width: "100%",
              borderRadius: "10px",
              display: "block",
              maxHeight: 420,
              objectFit: "cover",
              mb: 1.5,
            }}
          />
        )}
      </CardContent>

      {/* Actions — icon + count only, no text labels */}
      <CardActions sx={{ px: 2, pb: 1.5, pt: 0, gap: 0.5 }}>
        <Button
          size="small"
          startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          onClick={handleLike}
          sx={{
            color: liked ? "primary.main" : "text.disabled",
            backgroundColor: liked ? "primary.light" : "transparent",
            borderRadius: "8px",
            px: 1,
            "& .MuiButton-startIcon": { mr: 0.5 },
            "&:hover": {
              backgroundColor: liked ? "primary.light" : "background.paper",
              color: liked ? "primary.main" : "text.secondary",
            },
          }}
        >
          {likeCount}
        </Button>

        <Button
          size="small"
          startIcon={<ChatBubbleOutlineIcon />}
          onClick={() => navigate(`/post/${post.id}`)}
          sx={{
            color: "text.disabled",
            borderRadius: "8px",
            px: 1,
            "& .MuiButton-startIcon": { mr: 0.5 },
            "&:hover": { backgroundColor: "background.paper", color: "text.secondary" },
          }}
        >
          {post._count?.comments ?? 0}
        </Button>

        <Box sx={{ flex: 1 }} />

        <IconButton size="small" sx={{ color: "text.disabled" }} aria-label="share">
          <ShareOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </CardActions>
    </Card>
  );
}
