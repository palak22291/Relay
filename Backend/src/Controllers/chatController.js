const { prisma } = require("../../prisma/client");
const { encodeCursor, decodeCursor } = require("../Utils/cursor");
// const { safeEmit } = require("../socket");   // Phase 2 wires the broadcasts

// participants are always returned in this shape (never leak email/password)
const participantSelect = {
  select: {
    id: true,
    userId: true,
    lastReadAt: true,
    user: { select: { id: true, firstName: true, lastName: true } },
  },
};

const senderSelect = {
  select: { id: true, firstName: true, lastName: true },
};

// Authorization boundary: every message read/write requires membership.
// Returns the participant row (needed for lastReadAt) or null.
async function getParticipant(conversationId, userId) {
  return prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
}

/**
 * POST /api/chat/conversations
 * Create a conversation, or return the existing DM between the same two users.
 */
exports.createConversation = async (req, res) => {
  try {
    const meId = req.user.userId;
    const { participantIds, name } = req.body;

    // never trust the body for identity: drop self + duplicates, then re-add me
    const others = [...new Set(participantIds)].filter((id) => id !== meId);
    if (others.length === 0) {
      return res
        .status(400)
        .json({ error: "A conversation needs at least one other participant" });
    }

    // reject unknown user ids up front rather than failing on a foreign key
    const foundUsers = await prisma.user.findMany({
      where: { id: { in: others } },
      select: { id: true },
    });
    if (foundUsers.length !== others.length) {
      return res.status(400).json({ error: "One or more users do not exist" });
    }

    const isGroup = others.length > 1;

    // DM dedup: an existing non-group conversation whose participant set is
    // exactly these two users. `some` matches conversations containing each
    // user; the count check ensures there is nobody else in it.
    if (!isGroup) {
      const existing = await prisma.conversation.findFirst({
        where: {
          isGroup: false,
          AND: [
            { participants: { some: { userId: meId } } },
            { participants: { some: { userId: others[0] } } },
          ],
        },
        include: {
          participants: participantSelect,
          _count: { select: { participants: true } },
        },
      });

      if (existing && existing._count.participants === 2) {
        const { _count, ...conversation } = existing;
        return res.status(200).json({
          message: "Conversation already exists",
          conversation,
          created: false,
        });
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        isGroup,
        name: isGroup ? name || null : null, // DMs are never named
        participants: {
          create: [meId, ...others].map((userId) => ({ userId })),
        },
      },
      include: { participants: participantSelect },
    });

    res
      .status(201)
      .json({ message: "Conversation created", conversation, created: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create conversation" });
  }
};

/**
 * GET /api/chat/conversations
 * My conversations, most recent activity first, with last message + unread count.
 */
exports.getConversations = async (req, res) => {
  try {
    const meId = req.user.userId;

    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId: meId } } },
      orderBy: { updatedAt: "desc" },
      include: {
        participants: participantSelect,
        // last message only — the full history comes from the messages endpoint
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
    });

    // unread = messages from OTHERS newer than my lastReadAt (my own messages
    // are never "unread"). Counted per conversation in parallel.
    const withUnread = await Promise.all(
      conversations.map(async (c) => {
        const me = c.participants.find((p) => p.userId === meId);
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: c.id,
            senderId: { not: meId },
            ...(me?.lastReadAt ? { createdAt: { gt: me.lastReadAt } } : {}),
          },
        });

        const { messages, ...rest } = c;
        return { ...rest, lastMessage: messages[0] || null, unreadCount };
      })
    );

    res.json({ conversations: withUnread });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load conversations" });
  }
};

/**
 * GET /api/chat/conversations/:id/messages
 * Cursor-paginated history. Newest page first; each page returned oldest→newest.
 */
exports.getMessages = async (req, res) => {
  try {
    const meId = req.user.userId;
    const conversationId = parseInt(req.params.id);
    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({ error: "Invalid conversation id" });
    }

    if (!(await getParticipant(conversationId, meId))) {
      return res
        .status(403)
        .json({ error: "You are not a participant in this conversation" });
    }

    const limit = Math.min(parseInt(req.query.limit) || 30, 50);

    let cursorData = null;
    if (req.query.cursor) {
      try {
        cursorData = decodeCursor(req.query.cursor);
      } catch {
        return res.status(400).json({ error: "Invalid cursor" });
      }
    }

    // Walk BACKWARDS in time (newest first) so "load older" pages correctly.
    // Compound cursor breaks ties when two messages share a timestamp.
    const messagesDesc = await prisma.message.findMany({
      where: {
        conversationId,
        ...(cursorData
          ? {
              OR: [
                { createdAt: { lt: new Date(cursorData.createdAt) } },
                {
                  AND: [
                    { createdAt: new Date(cursorData.createdAt) },
                    { id: { lt: cursorData.id } },
                  ],
                },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit,
      include: { sender: senderSelect },
    });

    // cursor points at the OLDEST message of this page (where the next page starts)
    const nextCursor =
      messagesDesc.length === limit
        ? encodeCursor(messagesDesc[messagesDesc.length - 1])
        : null;

    // return oldest→newest so the UI can render top-to-bottom directly
    res.json({ messages: messagesDesc.reverse(), nextCursor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load messages" });
  }
};

/**
 * POST /api/chat/conversations/:id/messages
 * Send a message (REST is the source of truth; Phase 2 broadcasts it).
 */
exports.sendMessage = async (req, res) => {
  try {
    const meId = req.user.userId;
    const conversationId = parseInt(req.params.id);
    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({ error: "Invalid conversation id" });
    }

    if (!(await getParticipant(conversationId, meId))) {
      return res
        .status(403)
        .json({ error: "You are not a participant in this conversation" });
    }

    const { content } = req.body; // already validated + trimmed by zod

    // create the message and bump the conversation's sort key atomically
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: { conversationId, senderId: meId, content },
        include: { sender: senderSelect },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    // Phase 2: safeEmit(`conversation:${conversationId}`, "message:new",
    //            { ...message, actorId: meId })
    //          + conversation:updated to each participant's user room

    res.status(201).json({ message: "Message sent", data: message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
};

/**
 * POST /api/chat/conversations/:id/read
 * Mark the conversation read up to now (drives unread counts + read receipts).
 */
exports.markRead = async (req, res) => {
  try {
    const meId = req.user.userId;
    const conversationId = parseInt(req.params.id);
    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({ error: "Invalid conversation id" });
    }

    if (!(await getParticipant(conversationId, meId))) {
      return res
        .status(403)
        .json({ error: "You are not a participant in this conversation" });
    }

    const readAt = new Date();
    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId: meId } },
      data: { lastReadAt: readAt },
    });

    // Phase 2: safeEmit(`conversation:${conversationId}`, "message:read",
    //            { conversationId, userId: meId, readAt, actorId: meId })

    res.json({ message: "Marked as read", conversationId, readAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark as read" });
  }
};
