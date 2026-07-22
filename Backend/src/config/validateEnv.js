// Startup environment check + normalisation.
//
// Two production outages were caused by an env var that existed locally but
// was never added (or was subtly malformed) on Render. Both failed silently.
//
// This does three things at boot:
//   1. normalises values (strips whitespace/newlines and wrapping quotes —
//      the #1 cause of "the value looks identical but doesn't match")
//   2. prints an unmissable report
//   3. refuses to start if something fatal is missing
//
// NOTE: secret values are NEVER printed. Only presence, length and a short
// non-reversible fingerprint — enough to compare two environments without
// leaking anything into logs. GOOGLE_CLIENT_ID is printed in full because it
// is public (it ships inside the frontend bundle).

const crypto = require("crypto");

const FATAL = [
  { name: "DATABASE_URL", why: "database connection" },
  { name: "JWT_SECRET", why: "signing/verifying auth tokens" },
];

const FEATURE = [
  { name: "CURSOR_SECRET", why: "feed cursor pagination (GET /posts/feed will 500)" },
  { name: "GOOGLE_CLIENT_ID", why: "Google sign-in (POST /auth/google will fail)" },
];

// values safe to print in full (not secrets)
const PUBLIC_VARS = new Set(["GOOGLE_CLIENT_ID"]);

const fingerprint = (v) =>
  crypto.createHash("sha256").update(v).digest("hex").slice(0, 8);

// Strip surrounding quotes and whitespace. Pasting into a hosting dashboard
// very often adds a trailing newline/space or wrapping quotes, which makes a
// value that LOOKS right compare as different.
function normalise(raw) {
  let v = String(raw).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

function validateEnv() {
  const all = [...FATAL, ...FEATURE];
  const missingFatal = [];
  const missingFeature = [];
  const cleaned = [];

  console.log("─".repeat(64));
  console.log("Environment check");

  for (const v of all) {
    const raw = process.env[v.name];
    if (!raw) {
      (FATAL.includes(v) ? missingFatal : missingFeature).push(v);
      continue;
    }

    const clean = normalise(raw);
    if (clean !== raw) {
      // write the cleaned value back so the whole app uses the good one
      process.env[v.name] = clean;
      cleaned.push(v.name);
    }

    if (PUBLIC_VARS.has(v.name)) {
      // public → print exactly, wrapped in markers so stray characters show
      console.log(`  ${v.name} = [${clean}] (len ${clean.length})`);
    } else {
      console.log(`  ${v.name} ✓ set (len ${clean.length}, fp ${fingerprint(clean)})`);
    }
  }

  if (cleaned.length) {
    console.warn(
      `  🧹 normalised (had stray quotes/whitespace): ${cleaned.join(", ")}` +
        " — fix the value in your host's dashboard to silence this"
    );
  }

  for (const v of missingFeature) {
    console.error(`  ⚠️  MISSING ${v.name} — breaks: ${v.why}`);
  }

  if (missingFatal.length) {
    for (const v of missingFatal) {
      console.error(`  ❌ MISSING ${v.name} — required for: ${v.why}`);
    }
    console.log("─".repeat(64));
    throw new Error(
      `Refusing to start: missing required env var(s): ${missingFatal
        .map((v) => v.name)
        .join(", ")}`
    );
  }

  if (!missingFeature.length && !cleaned.length) {
    console.log("  all required variables set ✅");
  }
  console.log("─".repeat(64));
}

module.exports = { validateEnv, normalise };
