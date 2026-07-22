const express = require("express");
const router = express.Router();

const chatController = require("../Controllers/chatController");
const authMiddleware = require("../Middleware/auth");
const {
  validate,
  createConversationSchema,
  sendMessageSchema,
} = require("../Validation/schemas");

// every chat route requires a logged-in user; participant checks happen
// per-conversation inside the controller
router.use(authMiddleware);

router.post(
  "/conversations",
  validate(createConversationSchema),
  chatController.createConversation
);
router.get("/conversations", chatController.getConversations);

router.get("/conversations/:id/messages", chatController.getMessages);
router.post(
  "/conversations/:id/messages",
  validate(sendMessageSchema),
  chatController.sendMessage
);

router.post("/conversations/:id/read", chatController.markRead);

module.exports = router;
