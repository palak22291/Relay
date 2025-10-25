const express = require("express")
const router = express.Router()
// Router() creates a mini Express app only for organizing routes related to a specific feature (in this case, Likes).

const likeController = require("../Controllers/likeController")
const authMiddleware = require("../Middleware/auth");

router.post("/toggle/:postId",authMiddleware,likeController.toggleLike)

module.exports= router