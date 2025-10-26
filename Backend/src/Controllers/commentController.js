// const { prisma } = require("../../prisma/client");

// exports.createComment = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { postId } = req.params;
//     const {content} = req.body;

//     if (!content) return res.status(400).json({ error: "Content is required" });

//     const post = await prisma.post.findUnique({
//       where: { id: parseInt(postId) },
//     });
//     if (!post) return res.status(404).json({ error: "Post not found" });

// //     const comment = await prisma.comment.create({
//       data: {
//         content,
//         postId: parseInt(postId),
//         author: {
//           connect: { id: userId }, // connect to existing user
//         },
//       },
//       include: {
//         author: {
//           select: { id: true, firstName: true, email: true },
//         },
//       },
//     });

//     res.status(201).json({ message: "Comment added successfully", comment });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

// exports.getCommmentsByPost = async (req, res) => {
//   try {
//     const { postId } = req.params;

//     const comments = await prisma.comment.findMany({
//       where: {
//         postId: parseInt(postId),
//       },
//       include: {
//         author: {
//           select: { id: true, firstName: true, email: true },
//         },
//       },
//       orderBy: { createdAt:"desc"},
//     });
//     res.json({ comments });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

// exports.deleteComment = async (req, res) => {
//   try {
//     const {commentId} = req.params;
//     const userId = req.user.userId;

//     const existingComment = await prisma.comment.findUnique({
//       where: { id: parseInt(commentId) },
//     });
//     if (!existingComment)
//       return res.status(404).json({ error: "Comment not found" });

//     if (existingComment.userId !== userId) {
//       return res
//         .status(403)
//         .json({ error: "Unauthorized to delete this comment" });
//     }

//     await prisma.comment.delete({ where: { id: parseInt(commentId) } });
//     res.json({ message: "Comment deleted successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

const { prisma } = require("../../prisma/client");

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
            author: { connect: { id: userId } }, // connect existing user
            post: { connect: { id: parseInt(postId) } } // connect existing post
          },
      include: {
        author: {
          select: { id: true, firstName: true, email: true },
        },
      },
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
      orderBy: { createdAt: "desc" }, // must be string "desc"
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

    if (existingComment.authorId !== userId) { // use authorId, not userId
      return res.status(403).json({ error: "Unauthorized to delete this comment" });
    }

    await prisma.comment.delete({ where: { id: parseInt(commentId) } });
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
