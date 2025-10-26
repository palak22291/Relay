const express = require("express");
const router = express.Router();

const commentController = require("../Controllers/commentController")
const authMiddleware = require("../Middleware/auth");

router.post("/create/:postId",authMiddleware,commentController.createComment)

router.get("/:postId",authMiddleware,commentController.getCommentsByPost)

router.delete("/delete/:commentId", authMiddleware, commentController.deleteComment);

module.exports = router;