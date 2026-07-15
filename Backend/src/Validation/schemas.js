const { z } = require("zod");

// Replaces the ad-hoc `if (!content)` checks with declarative schemas.
// Each schema trims strings so "   " counts as empty, not valid.

const registerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const createPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),
  imageUrl: z.string().trim().min(1).nullish(),
});

// Bug 8: update must not clobber fields — every field optional, but if a
// field IS sent it must be non-empty (empty strings used to wipe fields).
const updatePostSchema = z
  .object({
    title: z.string().trim().min(1, "Title cannot be empty").optional(),
    content: z.string().trim().min(1, "Content cannot be empty").optional(),
    imageUrl: z.string().trim().min(1).nullish(),
  })
  .refine(
    (data) => data.title !== undefined || data.content !== undefined || data.imageUrl !== undefined,
    { message: "Nothing to update" }
  );

const createCommentSchema = z.object({
  content: z.string().trim().min(1, "Content is required"),
});

// Middleware factory: validates req.body, replaces it with the parsed
// (trimmed) data, or responds 400 with the first validation message.
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  req.body = result.data;
  next();
};

module.exports = {
  registerSchema,
  loginSchema,
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
  validate,
};
