const { OAuth2Client } = require("google-auth-library");
const { prisma } = require("../../prisma/client.js");
const { generateToken } = require("../Utils/jwt");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "No token provided" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, given_name, family_name } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Google provides given_name/family_name directly — prefer them over
      // splitting `name`, which loses multi-part surnames ("Del Rey" etc.)
      const firstName = given_name || name?.split(" ")[0] || "User";
      const lastName = family_name || name?.split(" ").slice(1).join(" ") || "";

      user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          // "" is the explicit marker for Google-only accounts (no usable
          // password). login() checks for it and points these users at the
          // Google button; bcrypt.compare against "" can never succeed.
          password: "",
        },
      });
    }

    const jwtToken = generateToken({ userId: user.id, email: user.email });

    // same shape as the normal login response
    res.json({
      message: "Google authentication successful",
      token: jwtToken,
      user: { id: user.id, firstName: user.firstName, email: user.email },
    });
  } catch (err) {
    console.error("Google Auth Error:", err.message);
    res.status(500).json({ error: "Google authentication failed" });
  }
};
