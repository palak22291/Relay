const express = require("express");
const { register, login } = require("../Controllers/authController");
const authMiddleware = require("../Middleware/auth");


const { googleAuth } = require("../Controllers/googleAuthController");
const { validate, registerSchema, loginSchema } = require("../Validation/schemas");

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/google", googleAuth);

router.get("/me", authMiddleware, (req, res) => {
  res.json({ message: "Protected route accessed!", user: req.user });
});

module.exports = router;
