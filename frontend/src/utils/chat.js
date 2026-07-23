// src/utils/chat.js
// Display helpers for conversations. A conversation's "title" and avatar depend
// on whether it's a group or a DM (the other participant).

const fullName = (u) =>
  `${u?.firstName || ""} ${u?.lastName || ""}`.trim() || "Unknown";

// the participant who isn't me (for DMs). Falls back to the first participant.
export function otherParticipant(conversation, myUserId) {
  const others = (conversation?.participants || []).filter(
    (p) => p.userId !== myUserId
  );
  return others[0] || conversation?.participants?.[0] || null;
}

// what to show as the conversation's name in the list / header
export function conversationTitle(conversation, myUserId) {
  if (conversation?.isGroup) {
    if (conversation.name) return conversation.name;
    // unnamed group → list the other members
    const names = (conversation.participants || [])
      .filter((p) => p.userId !== myUserId)
      .map((p) => p.user?.firstName)
      .filter(Boolean);
    return names.join(", ") || "Group";
  }
  const other = otherParticipant(conversation, myUserId);
  return fullName(other?.user);
}

// seed used for getAvatarStyle — the other user's id for a DM, or the
// conversation id for a group (stable, distinct per conversation)
export function conversationAvatarSeed(conversation, myUserId) {
  if (conversation?.isGroup) return conversation.id;
  const other = otherParticipant(conversation, myUserId);
  return other?.user?.id ?? conversation?.id;
}

export function conversationInitial(conversation, myUserId) {
  const title = conversationTitle(conversation, myUserId);
  return title?.[0]?.toUpperCase() || "?";
}
