const express = require("express")

const router = express.Router()

const userController = require("../Controllers/userController")
const authMiddleware = require("../Middleware/auth");

router.get("/me",authMiddleware,userController.getMe)
router.put("/me",authMiddleware,userController.updateProfile)
router.get("/:id",userController.getUserById)
router.post("/:userId/follow",authMiddleware,userController.followUser)
router.delete("/:userId/unfollow",authMiddleware,userController.unfollowUser)
router.get("/:userId/followers", userController.getFollowers);
router.get("/:userId/following", userController.getFollowing);


module.exports = router
