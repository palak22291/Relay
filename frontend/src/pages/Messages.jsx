// src/pages/Messages.jsx
// Conversations list. Reads the shared ConversationsContext (one fetch + live
// `conversation:updated`); clicking a row opens the chat window.
import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Badge,
  CircularProgress,
  Card,
} from "@mui/material";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";
import { getAvatarStyle } from "../utils/ui";
import {
  conversationTitle,
  conversationAvatarSeed,
  conversationInitial,
} from "../utils/chat";
import { useConversations } from "../context/ConversationsContext";
import { useCurrentUser } from "../context/CurrentUserContext";

function ConversationRow({ conversation, myUserId, onClick }) {
  const title = conversationTitle(conversation, myUserId);
  const seed = conversationAvatarSeed(conversation, myUserId);
  const style = getAvatarStyle(seed);
  const unread = conversation.unreadCount || 0;
  const last = conversation.lastMessage;

  // "you: " prefix when the last message was mine
  const preview = last
    ? `${last.senderId === myUserId ? "You: " : ""}${last.content}`
    : "No messages yet";

  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.5,
        cursor: "pointer",
        borderBottom: "0.5px solid",
        borderColor: "divider",
        transition: "background-color 0.12s ease",
        "&:hover": { backgroundColor: "action.hover" },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: "-2px",
        },
      }}
    >
      <Avatar sx={{ width: 44, height: 44, backgroundColor: style.bg, color: style.color }}>
        {conversation.isGroup ? (
          <GroupsOutlinedIcon sx={{ fontSize: 22 }} />
        ) : (
          conversationInitial(conversation, myUserId)
        )}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          <Typography
            noWrap
            sx={{
              fontSize: "15px",
              fontWeight: unread ? 600 : 500,
              color: "text.primary",
              flex: 1,
            }}
          >
            {title}
          </Typography>
          {last && (
            <Typography sx={{ fontSize: "12px", color: "text.disabled", flexShrink: 0 }}>
              {formatDistanceToNowStrict(new Date(last.createdAt), { addSuffix: false })}
            </Typography>
          )}
        </Box>
        <Typography
          noWrap
          sx={{
            fontSize: "13px",
            color: unread ? "text.secondary" : "text.disabled",
            fontWeight: unread ? 500 : 400,
          }}
        >
          {preview}
        </Typography>
      </Box>

      {unread > 0 && (
        <Badge
          badgeContent={unread}
          max={99}
          sx={{
            "& .MuiBadge-badge": {
              position: "static",
              transform: "none",
              backgroundColor: "primary.main",
              color: "#1A0E00",
              fontWeight: 600,
            },
          }}
        />
      )}
    </Box>
  );
}

export default function Messages() {
  const navigate = useNavigate();
  const { conversations, loading } = useConversations();
  const { currentUser } = useCurrentUser();
  const myUserId = currentUser?.userId;

  return (
    <Box>
      <Typography
        sx={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: "22px",
          color: "text.primary",
          mb: 2,
        }}
      >
        Messages
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress size={24} color="primary" />
        </Box>
      ) : conversations.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "text.primary" }}>
            No conversations yet
          </Typography>
          <Typography variant="body2">
            Start one from someone's post.
          </Typography>
        </Box>
      ) : (
        <Card sx={{ overflow: "hidden" }}>
          {conversations.map((c) => (
            <ConversationRow
              key={c.id}
              conversation={c}
              myUserId={myUserId}
              onClick={() => navigate(`/messages/${c.id}`)}
            />
          ))}
        </Card>
      )}
    </Box>
  );
}
