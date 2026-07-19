const { prisma } = require("../../prisma/client");
const { safeEmit } = require("../socket");

exports.createComment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;
    const { content } = req.body;

    if (!content) return res.status(400).json({ error: "Content is required" });

    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = await prisma.comment.create({
      data: {
        content,
        author: { connect: { id: userId } },
        post: { connect: { id: parseInt(postId) } },
      },
      include: {
        author: {
          select: { id: true, firstName: true, email: true },
        },
      },
    });

    // comment already includes author — receivers can render it directly
    safeEmit(`post:${parseInt(postId)}`, "comment:new", {
      comment,
      actorId: userId,
    });
    res.status(201).json({ message: "Comment added successfully", comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { postId: parseInt(postId) },
      include: {
        author: {
          select: { id: true, firstName: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });
    if (!existingComment)
      return res.status(404).json({ error: "Comment not found" });

    if (existingComment.authorId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this comment" });
    }

    await prisma.comment.delete({ where: { id: parseInt(commentId) } });

    safeEmit(`post:${existingComment.postId}`, "comment:deleted", {
      commentId: parseInt(commentId),
      actorId: userId,
    });
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Content cannot be empty" });
    }

    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found " });
    }

    // we need to make sure the user updating the comment is the owner or author of that comment

    if (existingComment.authorId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this comment" });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: { content },
    });

    safeEmit(`post:${existingComment.postId}`, "comment:updated", {
      commentId: updatedComment.id,
      content: updatedComment.content,
      actorId: userId,
    });
    res.json({
      message: "Comment updated successfully",
      updatedComment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
