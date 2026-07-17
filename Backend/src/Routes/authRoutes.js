const express = require("express");
const { register, login } = require("../Controllers/authController");
const authMiddleware = require("../Middleware/auth");


const { googleAuth } = require("../Controllers/googleAuthController");
const { validate, registerSchema, loginSchema } = require("../Validation/schemas");
const authLimiter = require("../Middleware/authRateLimit");

const router = express.Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/google", googleAuth);

router.get("/me", authMiddleware, async (req, res) => {
  try {
    // enrich the JWT payload ({ userId, email }) with the user's name so the
    // UI can render initials/greetings — same response shape, extra fields
    const { prisma } = require("../../prisma/client");
    const dbUser = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { firstName: true, lastName: true, email: true },
    });
    res.json({
      message: "Protected route accessed!",
      user: { userId: req.user.userId, ...dbUser },
    });
  } catch (err) {
    console.error(err);
    res.json({ message: "Protected route accessed!", user: req.user });
  }
});

module.exports = router;
