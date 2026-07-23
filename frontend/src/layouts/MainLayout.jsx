// src/layouts/MainLayout.jsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  Avatar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AddIcon from "@mui/icons-material/Add";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { useNavigate } from "react-router-dom";
import { getInitials, getAvatarStyle } from "../utils/ui";
import { useColorMode } from "../App";
import { useCurrentUser } from "../context/CurrentUserContext";
import { useConversations } from "../context/ConversationsContext";

// Warm rounded-square nav icon (Relay spec)
const navIconSx = {
  borderRadius: "8px",
  border: "0.5px solid",
  borderColor: "divider",
  width: 36,
  height: 36,
};

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const { mode, toggleMode } = useColorMode();
  const { currentUser: user, refresh } = useCurrentUser();
  const { totalUnread } = useConversations();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    refresh(); // drop the cached identity immediately, don't wait for a route effect
    navigate("/login");
  };

  const avatarStyle = getAvatarStyle(user?.userId);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky">
        <Toolbar sx={{ maxWidth: 560, width: "100%", mx: "auto", gap: 1, px: { xs: 2, sm: 0 } }}>
          {/* Wordmark — serif, period in amber */}
          <Typography
            onClick={() => navigate("/")}
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "20px",
              color: "text.primary",
              letterSpacing: "-0.3px",
              cursor: "pointer",
              mr: "auto",
              userSelect: "none",
              "& span": { color: "primary.main" },
            }}
          >
            Relay<span>.</span>
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
            onClick={() => navigate("/create")}
          >
            New post
          </Button>

          {/* Dark/light toggle */}
          <IconButton onClick={toggleMode} sx={navIconSx} aria-label="toggle color mode">
            {mode === "dark" ? (
              <LightModeOutlinedIcon sx={{ fontSize: 18 }} />
            ) : (
              <DarkModeOutlinedIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>

          {/* Messages — amber unread badge, live via ConversationsContext */}
          <IconButton
            onClick={() => navigate("/messages")}
            sx={navIconSx}
            aria-label={`Messages${totalUnread ? `, ${totalUnread} unread` : ""}`}
          >
            <Badge
              badgeContent={totalUnread}
              max={99}
              overlap="circular"
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "primary.main",
                  color: "#1A0E00",
                  fontWeight: 600,
                  fontSize: "10px",
                  minWidth: 16,
                  height: 16,
                },
              }}
            >
              <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />
            </Badge>
          </IconButton>

          {/* Bell — badge count wires to the notifications feature later */}
          <IconButton sx={navIconSx}>
            <Badge color="primary" badgeContent={0}>
              <NotificationsNoneIcon sx={{ fontSize: 18 }} />
            </Badge>
          </IconButton>

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: avatarStyle.bg,
                color: avatarStyle.color,
              }}
            >
              {getInitials(user?.firstName, user?.lastName)}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled sx={{ opacity: "1 !important" }}>
              <Typography variant="body2">{user?.email || "Not signed in"}</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>Log out</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ maxWidth: 560, px: 2, py: 3 }}>
        {children}
      </Container>
    </Box>
  );
}
