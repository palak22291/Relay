const express = require("express");
const router = express.Router();

const commentController = require("../Controllers/commentController")
const authMiddleware = require("../Middleware/auth");
const { validate, createCommentSchema } = require("../Validation/schemas");

router.post("/create/:postId",authMiddleware,validate(createCommentSchema),commentController.createComment)

// public: posts are public, so reading their comments must be too
router.get("/:postId",commentController.getCommentsByPost)

router.put("/update/:commentId",authMiddleware,commentController.updateComment)

router.delete("/delete/:commentId", authMiddleware, commentController.deleteComment);


module.exports = router;