# Relay — a real-time social feed

> Repo history and deployment names use the project's original name, **Connectify**.

**Live demo:** [https://connectify-palaks-projects-63c6e26a.vercel.app](https://connectify-palaks-projects-63c6e26a.vercel.app)

Relay is a full-stack social feed with live updates: new posts, comments, likes, and typing indicators stream to connected clients over WebSockets, while all writes stay on a validated REST API.

## Architecture — REST for writes, sockets for broadcast

The client **never** creates a post/comment/like over the socket. It calls the REST endpoint; the controller writes to Postgres, then broadcasts an event. Validation, auth, and rate limiting live in exactly one place, and the app degrades gracefully if the socket disconnects — everything still works, just not live.

```
 ┌──────────┐  1. POST /api/comments/create/7   ┌─────────────┐
 │ Client A │ ────────────────────────────────► │  Express     │
 │ (actor)  │ ◄──────────────────────────────── │  controller  │
 └──────────┘  2. 201 + payload (updates own UI)│              │
                                                │ 3. write     │
                                                ▼              │
                                          ┌──────────┐         │
                                          │ Postgres │         │
                                          └──────────┘         │
                                                │ 4. safeEmit  │
                                                ▼              
 ┌──────────┐   5. "comment:new" to room post:7 ┌─────────────┐
 │ Client B │ ◄──────────────────────────────── │  Socket.io   │
 │ (viewer) │                                   │  (same port) │
 └──────────┘                                   └─────────────┘
```

- **Actor/receiver split:** the actor updates its UI from the REST response; everyone else updates from the socket event. Every payload carries `actorId`, and clients skip events where `actorId === currentUser.userId` — no double-applies.
- **Rooms scope the fan-out:** every client joins `feed`; clients viewing a post join `post:{id}` (and leave on unmount). Comment events only reach clients in that post's room — O(interested clients), not O(all clients).
- **Socket auth:** JWT in the handshake (`socket.handshake.auth.token`), verified by the same `verifyToken` util as the REST middleware. Invalid token → connection rejected. Logged-out users simply don't get live updates.
- **`safeEmit`:** every broadcast is wrapped in try/catch — a socket-layer failure can never 500 a REST response.

## Real-time event contract

| Feature | Event | Room | Payload |
|---|---|---|---|
| New post in feed | `post:new` | `feed` | full post (author + `_count`) + `actorId` |
| Post deleted | `post:deleted` | `feed` | `{ postId, actorId }` |
| New comment | `comment:new` | `post:{id}` | full comment (author) + `actorId` |
| Comment edited | `comment:updated` | `post:{id}` | `{ commentId, content, actorId }` |
| Comment deleted | `comment:deleted` | `post:{id}` | `{ commentId, actorId }` |
| Like count changed | `like:updated` | `post:{id}` **and** `feed` | `{ postId, likeCount, liked, actorId }` |
| Typing indicator | `typing:start` / `typing:stop` | `post:{id}` | `{ userId, firstName }` (sender excluded) |

Client → server: `post:join` / `post:leave` (postId validated server-side), `typing:start` / `typing:stop` (throttled client-side, rate-limited per socket server-side).

## Engineering notes

- **Cursor (keyset) pagination** on the default feed with a compound `(createdAt, id)` cursor — offset pagination breaks under live inserts (new posts shift pages, "load more" returns duplicates). Search/sort views use offset with dedupe-by-id.
- **Race-safe like toggle:** create-first, catch the unique-constraint violation (`P2002`) and delete instead — the DB constraint is the guard, not check-then-act. Returns an absolute `likeCount`; clients assign, never increment.
- **Reconnect strategy:** socket.io replays nothing, so on `reconnect` the feed refetches page 1, post pages re-join their room and refetch comments.
- **Rate limiting:** per-IP on auth endpoints (10 failed/15 min) and the feed; per-socket counter on typing events (20/10 s).
- **Validation:** zod schemas on every mutating body; `helmet` for headers; CORS locked to known origins (localhost only in dev).

**Scaling path (single Render instance today):** socket rooms are in-memory, so multiple instances would need `@socket.io/redis-adapter`; like/comment counts could move to denormalized columns; read replicas for the feed.

**Known tradeoffs:** access token in localStorage without a refresh-token flow (schema exists, endpoint deliberately deferred); socket auth is handshake-only, so an expired token stays connected until reconnect.

## Stack

React 18 · MUI · socket.io-client | Node · Express 5 · Socket.io · Prisma 6 · PostgreSQL | JWT auth (+ Google Sign-In) | Vercel (frontend) · Render (API + sockets) · Aiven (Postgres)

## Local development

```bash
# Backend  (Backend/.env: DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID)
cd Backend && npm install
npx prisma migrate dev
node src/index.js            # REST + sockets on :5001 (PORT to override)

# Frontend (frontend/.env: REACT_APP_API_URL, REACT_APP_GOOGLE_CLIENT_ID)
cd frontend && npm install
npm start                    # :3000; socket URL is derived from the API origin
```

`frontend/.env.development.local` can point `REACT_APP_API_URL` at a local backend without touching the production values in `.env`.

## Deployment notes

- Render supports WebSockets natively — sockets share the REST port, no extra config. Set `NODE_ENV=production` (activates strict CORS).
- The socket client connects to the API **origin** (derived from `REACT_APP_API_URL`), not the `/api` path.
- Free-tier cold starts: Render sleeps (~30 s wake) and Aiven's free Postgres powers off when idle (DNS drops while asleep — it looks deleted, it isn't). Sockets auto-reconnect once the server wakes; warm it up before a demo.

---

**Developed by Palak Gupta** — 2nd year engineering student.
