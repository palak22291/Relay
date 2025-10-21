
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const authRoutes = require("./Routes/authRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
// very imp lin this will decide what will be our api endpoint
// “For any request that starts with /api/auth, use the routes defined inside authRoutes file.”

app.get("/", (req, res) => res.send("API is running 🚀"));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
