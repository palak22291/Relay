const { prisma } = require("../../prisma/client");
const { safeEmit } = require("../socket");

// if the user has already liked the post → it will remove the like
// If the user has not liked the post yet → it will add the like
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.userId;
    const postId = parseInt(req.params.postId);

    // now we will check if our post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Race-safe toggle: instead of check-then-act (findUnique + create, which
    // 500s with P2002 when two rapid clicks both pass the check), we rely on
    // the @@unique([userId, postId]) constraint itself:
    // try to create; if the like already exists (P2002) delete it instead.
    let liked;
    try {
      await prisma.like.create({
        data: { userId, postId },
      });
      liked = true;
    } catch (err) {
      if (err.code === "P2002") {
        try {
          await prisma.like.delete({
            where: { userId_postId: { userId, postId } },
          });
        } catch (delErr) {
          // P2025 = already deleted by a concurrent request — same outcome
          if (delErr.code !== "P2025") throw delErr;
        }
        liked = false;
      } else {
        throw err;
      }
    }

    // fresh absolute count — receivers always trust this over client-side math
    const likeCount = await prisma.like.count({ where: { postId } });

    const payload = { postId, likeCount, liked, actorId: userId };
    safeEmit(`post:${postId}`, "like:updated", payload);
    safeEmit("feed", "like:updated", payload);

    return res.json({
      message: liked ? "Post liked successfully" : "Like removed successfully",
      liked,
      likeCount,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
