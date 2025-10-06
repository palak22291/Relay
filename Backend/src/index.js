const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { prisma } = require("./prisma/client");  

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


app.post("/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await prisma.user.create({
      data: { name, email, password }
    });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});


app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
