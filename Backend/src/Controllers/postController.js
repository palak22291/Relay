const { prisma } = require("../../prisma/client");
const { encodeCursor, decodeCursor } = require("../Utils/cursor");
const { safeEmit } = require("../socket");

// create a new post

exports.createPost = async (req, res) => {
  try {
    const { title, imageUrl, content } = req.body;
    // body already validated by zod (createPostSchema) in the route

    const created = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        authorId: req.user.userId,
        // this info of userr comes from auth middleware
      },
    });

    // refetch with the same shape the feed renders (author + counts) so
    // socket receivers can prepend it directly
    const post = await prisma.post.findUnique({
      where: { id: created.id },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    safeEmit("feed", "post:new", { post, actorId: req.user.userId });
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
    // cap the page size so ?limit=100000 can't dump the whole table
    const limit = Math.min(parseInt(req.query.limit) || 5, 20);
    const search = req.query.search || "";
    const skip = (page - 1) * limit;
    const category = req.query.category || "";
    const published = req.query.published;
    // const order = req.query.order === "asc" ? "asc" : "desc";
    // const sortBy = req.query.sortBy || "createdAt";

    // ---- SORTING LOGIC ----
    const sortQuery = req.query.sortBy || "newest";
    let sortBy;
    let order;

    // NEWEST FIRST
    if (sortQuery === "newest") {
      sortBy = "createdAt";
      order = "desc";
    }

    // OLDEST FIRST
    else if (sortQuery === "oldest") {
      sortBy = "createdAt";
      order = "asc";
    }

    // MOST COMMENTED
    else if (sortQuery === "mostCommented") {
      sortBy = "mostCommented"; // temporary marker
      order = "desc";
    }

    // default fallback
    else {
      sortBy = "createdAt";
      order = "desc";
    }

    // filtering

    const filterConditions = {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { content: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        category ? { category: category } : {},
        published !== undefined ? { published: published === "true" } : {},
      ],
    };

    // let orderByObj;
    // if (sortBy==="mostLiked"){
    //   orderByObj = { likes: { _count: order } };

    // }
    // else if(sortBy==="mostCommented") {
    //   orderByObj = { comments: { _count: order } };

    // }
    // else{
    //   orderByObj = { [sortBy]: order };
    // }

    let orderByObj;

    if (sortQuery === "mostCommented") {
      orderByObj = { comments: { _count: "desc" } };
    } else {
      orderByObj = { [sortBy]: order };
    }

    // now we will fecth posts with pagination and search and sorting
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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        // current user's own like only → frontend derives likedByMe
        ...(req.user
          ? { likes: { where: { userId: req.user.userId }, select: { id: true } } }
          : {}),
      },
      orderBy: orderByObj,
      // dynamic sorting using req.params
      skip,
      take: limit,

      // wihtout include we will only get the authorId not the author details
    });

    // total posts count
    // Without count, you only get the current page’s posts and cannot know how many pages exist in total.

    const totalPosts = await prisma.post.count({
      where: filterConditions,
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

exports.getFeedPosts = async (req, res) => {
  try {
    // in url the value of the query parameters will be string but we do parseInt because db query expects number not string
    // bydefault posts will be shown 10 but a safety cap of 20

    const limit = Math.min(parseInt(req.query.limit) || 10, 20);
    const cursor = req.query.cursor;

    let cursorData = null;
    if (cursor) {
      cursorData = decodeCursor(cursor);
    }

    // new date converts string into js date object

    const posts = await prisma.post.findMany({
      take: limit,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      where: cursorData
        ? {
            OR: [
              { createdAt: { lt: new Date(cursorData.createdAt) } },
              {
                AND: [
                  { createdAt:  new Date(cursorData.createdAt)  },
                  // same timestamp but older id
                  { id: { lt: cursorData.id } },
                ],
              },
            ],
          }
        : undefined,

      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        ...(req.user
          ? { likes: { where: { userId: req.user.userId }, select: { id: true } } }
          : {}),
      },
    });

    // now what if there is more data after this page
    // if yes we will send a nextCursor otherwise null

    let nextCursor = null;

    if (posts.length == limit) {
      // nextCursor = null (frontend will stop infinite scrolling)
      const lastPost = posts[posts.length- 1];
      // array[index]
      nextCursor = encodeCursor(lastPost);
    }

    res.json({
      posts,
      nextCursor,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "failed to load feed" });
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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        ...(req.user
          ? { likes: { where: { userId: req.user.userId }, select: { id: true } } }
          : {}),
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

    safeEmit("feed", "post:deleted", {
      postId: parseInt(id),
      actorId: req.user.userId,
    });
    res.json({ message: "Post deleted successfully", post: deletedPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
