// src/pages/ChatWindow.jsx
// Phase 3 placeholder — the full chat window (history, live messages, composer,
// read receipts) is built in Phase 4. For now this confirms routing works and
// resolves the conversation title from the shared list.
import React from "react";
import { Box, Typography, Button, Avatar } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { useParams, useNavigate } from "react-router-dom";
import { getAvatarStyle } from "../utils/ui";
import {
  conversationTitle,
  conversationAvatarSeed,
  conversationInitial,
} from "../utils/chat";
import { useConversations } from "../context/ConversationsContext";
import { useCurrentUser } from "../context/CurrentUserContext";

export default function ChatWindow() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { conversations } = useConversations();
  const { currentUser } = useCurrentUser();
  const myUserId = currentUser?.userId;

  const conversation = conversations.find((c) => c.id === Number(conversationId));
  const title = conversation
    ? conversationTitle(conversation, myUserId)
    : "Conversation";
  const style = getAvatarStyle(
    conversation ? conversationAvatarSeed(conversation, myUserId) : conversationId
  );

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
          onClick={() => navigate("/messages")}
          sx={{ px: 1 }}
        >
          Back
        </Button>
        <Avatar sx={{ width: 36, height: 36, backgroundColor: style.bg, color: style.color }}>
          {conversation?.isGroup ? (
            <GroupsOutlinedIcon sx={{ fontSize: 20 }} />
          ) : conversation ? (
            conversationInitial(conversation, myUserId)
          ) : (
            "?"
          )}
        </Avatar>
        <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "text.primary" }}>
          {title}
        </Typography>
      </Box>

      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="body2" color="text.disabled">
          The chat window arrives in Phase 4.
        </Typography>
      </Box>
    </Box>
  );
}
