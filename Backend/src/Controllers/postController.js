const { prisma } = require("../../prisma/client");

// create a new post

exports.createPost = async (req, res) => {
  try {
    const { title, imageUrl, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and Content are required" });
    }
    const post = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        authorId: req.user.userId,
        // this info of userr comes from auth middleware
      },
    });
    res.status(201).json({ message: "Post created successfully", post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// get all posts(fetch mutliple posts using page limit and search )
// Query parameters are always strings by default.

exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;
    const category = req.query.category || "" ;
    const published= req.query.published 

    // filtering 

    const filterConditions={
      AND:[
        search ?{
          OR:[
            {title:{contains:search}},
            {content:{contains:search}}
          ]

        } : {},
        category ? {category: category} :{},
        published !== undefined ? {published: published === "true"} : {}

      ]
    }


      // now we will fecth posts with pagination and search
    const posts = await prisma.post.findMany({
      where: filterConditions,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,

      // wihtout include we will only get the authorId not the author details
    });

    // total posts count
    // Without count, you only get the current page’s posts and cannot know how many pages exist in total.

    const totalPosts = await prisma.post.count({
      where: filterConditions
    });
    res.json({
      page,
      limit,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      posts,
    });
    // totalPosts + totalPages → metadata for pagination
    // posts → actual data to display
     // Together, it makes your backend API pagination-ready and search-enabled.
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "something went wrong" });
  }
};

// get a single post by its id

exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            email: true,
          },
        },
      },
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "something went wrong" });
  }
};

// updating  a post

exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, imageUrl } = req.body;

    const existingPost = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingPost) return res.status(404).json({ error: "Post not found" });
    if (existingPost.authorId !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this post" });
    }

    const updatedPost = await prisma.post.update({
      where: { id: parseInt(id) },
      data: { title, imageUrl, content },
    });
    res.json({ message: "Post updated successfully", post: updatedPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "something went wrong" });
  }
};

// deleting a  post

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const existingPost = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingPost) return res.status(404).json({ error: "Post not found" });
    if (existingPost.authorId !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this post" });
    }

    const deletedPost = await prisma.post.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Post deleted successfully", post: deletedPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
