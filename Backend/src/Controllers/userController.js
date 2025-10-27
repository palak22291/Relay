// const { prisma } = require("../../prisma/client");
// console.log("Prisma import test:", prisma);

// // to get the current logged in user
// exports.getMe = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         id: true,
//         firstName: true,
//         lastName: true,
//         email: true,
//         posts: true,
//         comments: true,
//         likes: true,
//         followers: {
//           select: {
//             follower: {
//               select: {
//                 id: true,
//                 firstName: true,
//                 email: true,
//               },
//             },
//           },
//         },
//         following: {
//           select: {
//             following: {
//               select: {
//                 id: true,
//                 firstName: true,
//                 email: true,
//               },
//             },
//           },
//         },
//       },
//     });
//     if (!user) return res.status(404).json({ error: "User not found" });
//     res.json({ user });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

// // update user profile

// exports.updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { firstName, lastName } = req.body;

//     const updatedUser = await prisma.user.update({
//       where: { id: userId },
//       data: { firstName, lastName },
//     });

//     res.json({ message: "Profile updated successfully", user: updatedUser });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

// // get user by id ( to view other public profiles)
// exports.getUserById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const user = await prisma.user.findUnique({
//       where: { id: parseInt(id) },
//       select: {
//         id: true,
//         firstName: true,
//         lastName: true,
//         email: true,
//         posts: true,
//         comments: true,
//         likes: true,
//         followers: {
//           select: {
//             follower: {
//               select: {
//                 id: true,
//                 firstName: true,
//                 email: true,
//               },
//             },
//           },
//         },
//         following: {
//           select: {
//             following: {
//               select: {
//                 id: true,
//                 firstName: true,
//                 email: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!user) return res.status(404).json({ error: "User not found" });

//     res.json(user);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

// // follow a user

// exports.followUser = async (req, res) => {

//     try {
//       const followerId = req.user.userId; // current logged-in user
//       const { userId } = req.params; // user to follow
//       console.log("followerId:", followerId, "userId:", userId);

  
//       if (!userId) {
//         return res.status(400).json({ error: "User ID is required in params" });
//       }
  
//       const followingId = parseInt(userId);
  
//       if (followerId === followingId) {
//         return res.status(400).json({ error: "You cannot follow yourself" });
//       }
  
//       // check if the user to follow exists
//       const userToFollow = await prisma.user.findUnique({ where: { id: followingId } });
//       if (!userToFollow) {
//         return res.status(404).json({ error: "User to follow not found" });
//       }
  
//       // check if already following
//       const existingFollow = await prisma.follower.findUnique({
//         where: {
//           followerId_followingId: {
//             followerId,
//             followingId,
//           },
//         },
//       });
//       if (existingFollow) {
//         return res.status(400).json({ error: "You are already following this user" });
//       }
  
//       const follow = await prisma.follower.create({
//         data: { followerId, followingId },
//       });
  
//       res.json({ message: "User followed successfully", follower });
//     } catch (err) {
//       console.error("Follow User Error:", err);
//       res.status(500).json({ error: `Something went wrong ${err}` });
//     }
//   };
  
// // unfollow a user


// exports.unfollowUser = async (req, res) => {
//     try {
//       const followerId = req.user.userId;
//       const { userId } = req.params;
//       const followingId = parseInt(userId);
  
//       if (followerId === followingId) {
//         return res.status(400).json({ error: "You cannot unfollow yourself" });
//       }
  
//       const existingFollow = await prisma.follow.findUnique({
//         where: {
//           followerId_followingId: { followerId, followingId },
//         },
//       });
  
//       if (!existingFollow) {
//         return res.status(400).json({ error: "You are not following this user" });
//       }
  
//       await prisma.follow.delete({
//         where: {
//           followerId_followingId: { followerId, followingId },
//         },
//       });
  
//       res.json({ message: "User unfollowed successfully" });
//     } catch (err) {
//       console.error("Unfollow User Error:", err);
//       res.status(500).json({ error: "Something went wrong" });
//     }
//   };
  
// // get followers of a user

// exports.getFollowers = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const followers = await prisma.follow.findMany({
//       where: { followingId: parseInt(userId) },
//       include: {
//         follower: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             email: true,
//           },
//         },
//       },
//     });

//     res.json({ followers });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: `Something went wrong ${err}` });
//   }
// };

// // get following of a user

// exports.getFollowing = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const following = await prisma.follow.findMany({
//       where: { followerId: parseInt(userId) },
//       include: {
//         following: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             email: true,
//           },
//         },
//       },
//     });

//     res.json({ following });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };



const { prisma } = require("../../prisma/client");

exports.getMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        posts: true,
        comments: true,
        likes: true,
        followers: {
          select: {
            follower: {
              select: { id: true, firstName: true, email: true },
            },
          },
        },
        following: {
          select: {
            following: {
              select: { id: true, firstName: true, email: true },
            },
          },
        },
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.updateProfile = async (req, res) => {
      try {
        const userId = req.user.userId;
        const { firstName, lastName } = req.body;
    
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { firstName, lastName },
        });
    
        res.json({ message: "Profile updated successfully", user: updatedUser });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
      }
    };

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        posts: true,
        comments: true,
        likes: true,
        followers: {
          select: {
            follower: { select: { id: true, firstName: true, email: true } },
          },
        },
        following: {
          select: {
            following: { select: { id: true, firstName: true, email: true } },
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.followUser = async (req, res) => {
  try {
    const followerId = req.user.userId;
    const { userId } = req.params;
    const followingId = parseInt(userId);

    if (!userId) return res.status(400).json({ error: "User ID is required" });
    if (followerId === followingId) return res.status(400).json({ error: "You cannot follow yourself" });

    const userToFollow = await prisma.user.findUnique({ where: { id: followingId } });
    if (!userToFollow) return res.status(404).json({ error: "User not found" });

    const existingFollow = await prisma.follower.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (existingFollow) return res.status(400).json({ error: "Already following" });

    const follow = await prisma.follower.create({ data: { followerId, followingId } });
    res.json({ message: "User followed successfully", follow });
  } catch (err) {
    console.error("Follow User Error:", err);
    res.status(500).json({ error: `Something went wrong ${err}` });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.userId;
    const { userId } = req.params;
    const followingId = parseInt(userId);

    if (followerId === followingId) return res.status(400).json({ error: "You cannot unfollow yourself" });

    const existingFollow = await prisma.follower.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (!existingFollow) return res.status(400).json({ error: "You are not following this user" });

    await prisma.follower.delete({ where: { followerId_followingId: { followerId, followingId } } });
    res.json({ message: "User unfollowed successfully" });
  } catch (err) {
    console.error("Unfollow User Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const followers = await prisma.follower.findMany({
      where: { followingId: parseInt(userId) },
      include: { follower: { select: { id: true, firstName: true, email: true } } },
    });
    res.json({ followers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Something went wrong ${err}` });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const following = await prisma.follower.findMany({
      where: { followerId: parseInt(userId) },
      include: { following: { select: { id: true, firstName: true, email: true } } },
    });
    res.json({ following });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
