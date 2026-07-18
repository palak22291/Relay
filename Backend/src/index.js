
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
dotenv.config();

const authRoutes = require("./Routes/authRoutes");
const postRoutes= require("./Routes/postRoutes")
const likeRoutes = require("./Routes/likeRoutes")
const commentRoutes = require("./Routes/commentRoutes")
const userRoutes = require("./Routes/userRoutes");



// single source of truth for allowed origins — Phase 1 socket setup reuses this
const CORS_ORIGINS = [
  'https://relay-palakgupta.vercel.app',
  "https://relay-git-main-palakgupta.vercel.app",
  "https://relay-3i5qc1etx-palakgupta.vercel.app",
];
// any localhost port, dev only — never in production
if (process.env.NODE_ENV !== "production") {
  CORS_ORIGINS.push(/^http:\/\/localhost:\d+$/);
}

const app = express();
app.use(helmet());
app.use(
    cors({
      origin: CORS_ORIGINS,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );
  
app.use(express.json());
// made changes in cors 

// API routes
app.use("/api/auth", authRoutes);
// very imp lin this will decide what will be our api endpoint
// “For any request that starts with /api/auth, use the routes defined inside authRoutes file.”
app.use("/api/posts",postRoutes)
app.use("/api/likes", likeRoutes)
app.use("/api/comments",commentRoutes)
app.use("/api/users", userRoutes);


app.get("/", (req, res) => res.send("API is running"));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


