// Stricter limiter for the auth endpoints (login/register/google).
// Guards against credential brute-force: 10 attempts per IP per 15 minutes.
// Separate from feedLimiter so a burst of reads never uses up login budget.

const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  // only failed attempts count toward the limit — a user who logs in
  // successfully isn't penalized for a later legitimate re-login
  skipSuccessfulRequests: true,
  message: {
    error: "Too many attempts. Please try again in a few minutes.",
  },
});

module.exports = authLimiter;
