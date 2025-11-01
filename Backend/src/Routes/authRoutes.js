const express = require("express");
const { register, login } = require("../Controllers/authController");
const authMiddleware = require("../Middleware/auth");


const { googleAuth } = require("../Controllers/googleAuthController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);

router.get("/me", authMiddleware, (req, res) => {
  res.json({ message: "Protected route accessed!", user: req.user });
});

module.exports = router;
