const { OAuth2Client } = require("google-auth-library");
const { prisma } = require("../../prisma/client.js");
const { generateToken } = require("../Utils/jwt");
const { normalise } = require("../config/validateEnv");

// read fresh + normalised at call time: a stray space/newline/quote pasted into
// a hosting dashboard is the usual cause of "audience mismatch" when the value
// looks identical to the frontend's
const clientId = () =>
  process.env.GOOGLE_CLIENT_ID ? normalise(process.env.GOOGLE_CLIENT_ID) : "";

const client = new OAuth2Client(clientId());

// Read a JWT's payload WITHOUT verifying it — diagnostics only, never trusted
// for auth decisions. Used to report which client id the token was issued for.
function peekAudience(idToken) {
  try {
    const payload = JSON.parse(
      Buffer.from(String(idToken).split(".")[1], "base64").toString("utf8")
    );
    return payload.aud;
  } catch {
    return null;
  }
}

exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "No token provided" });
    }

    // misconfigured server — say so plainly instead of failing as "invalid token"
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error("Google Auth: GOOGLE_CLIENT_ID is not set on this server");
      return res
        .status(500)
        .json({ error: "Google sign-in is not configured on the server" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId(),
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

    // an audience mismatch means the server's GOOGLE_CLIENT_ID differs from
    // the one the frontend used — the single most common deploy misconfig.
    // Log BOTH values (client ids are public) so the difference is obvious,
    // including invisible characters.
    if (/audience|recipient/i.test(err.message || "")) {
      const expected = clientId();
      const actual = peekAudience(req.body?.token);
      console.error("Google Auth: audience mismatch");
      console.error(`  server expects : [${expected}] (len ${expected.length})`);
      console.error(
        `  token issued to: [${actual ?? "unreadable"}]` +
          (actual ? ` (len ${String(actual).length})` : "")
      );
      return res.status(500).json({
        error:
          "Google sign-in misconfigured: this server's GOOGLE_CLIENT_ID doesn't match the one the app signed in with",
      });
    }
    if (/expired/i.test(err.message || "")) {
      return res
        .status(401)
        .json({ error: "Google sign-in expired. Please try again." });
    }
    res.status(500).json({ error: "Google authentication failed" });
  }
};
