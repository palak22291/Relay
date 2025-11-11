
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const authRoutes = require("./Routes/authRoutes");
const postRoutes= require("./Routes/postRoutes")
const likeRoutes = require("./Routes/likeRoutes")
const commentRoutes = require("./Routes/commentRoutes")
const userRoutes = require("./Routes/userRoutes");



const app = express();
app.use(
    cors({
      origin: "https://connectify-palaks-projects-63c6e26a.vercel.app",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );
  
app.use(express.json());


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


