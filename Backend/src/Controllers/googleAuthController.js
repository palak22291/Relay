const { OAuth2Client } = require("google-auth-library");
const { prisma } = require("../../prisma/client.js");
const { generateToken } = require("../Utils/jwt");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (req, res) => {
  console.log(" Incoming Google auth request...");
  try {
    const { token } = req.body;
    console.log("📥 Received token:", token ? " Yes" : " No");

    if (!token) {
      return res.status(400).json({ error: "No token provided" });
    }

    
    console.log("🔍 Verifying token with Google...");
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log(" Google verification success:", payload.email);

    const { email, name, picture } = payload;

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log(" Creating new Google user:", email);
      user = await prisma.user.create({
        data: {
          firstName: name?.split(" ")[0] || "",
          lastName: name?.split(" ")[1] || "",
          email,
          password: "",
          // profilePic: picture || "",
          // authProvider: "google",
        },
      });
    } else {
      console.log(" Existing user found:", email);
    }

    const jwtToken = generateToken({ userId: user.id, email: user.email });
    console.log(" JWT generated for user:", user.email);

    res.json({
      message: "Google authentication successful",
      token: jwtToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    console.error(" Google Auth Error:", err);
    res.status(500).json({ error: "Google authentication failed" });
  }
};
