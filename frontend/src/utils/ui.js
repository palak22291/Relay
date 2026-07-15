// src/utils/ui.js

export const getInitials = (first, last) => {
  const f = (first || "").trim();
  const l = (last || "").trim();
  if (!f && !l) return "U";
  return `${f[0] || ""}${l[0] || ""}`.toUpperCase();
};

// RELAY avatar system — six warm tonal pairs, deterministic by userId.
// No purple, no neon (one very muted violet allowed).
const AVATAR_PAIRS = [
  { bg: "#2D3A2E", color: "#8FBF94" }, // moss
  { bg: "#3A2E1E", color: "#C9A26B" }, // camel/amber
  { bg: "#1E2D33", color: "#6BB8C9" }, // teal
  { bg: "#33201E", color: "#C97A6B" }, // terracotta
  { bg: "#2E2833", color: "#A98FC9" }, // muted violet (only violet allowed — very muted)
  { bg: "#2A331E", color: "#A3C96B" }, // olive
];

export function getAvatarStyle(userId) {
  const index = (Number(userId) || 0) % AVATAR_PAIRS.length;
  return AVATAR_PAIRS[index];
}
