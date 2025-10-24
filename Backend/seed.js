const { prisma } = require("./prisma/client");

async function main() {

  const user1 = await prisma.user.upsert({
    where: { email: "user1@example.com" },
    update: {},
    create: {
      firstName: "Alice",
      lastName: "Smith",
      email: "user1@example.com",
      password: "hashedpassword1",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "user2@example.com" },
    update: {},
    create: {
      firstName: "Bob",
      lastName: "Johnson",
      email: "user2@example.com",
      password: "hashedpassword2",
    },
  });


  const post1 = await prisma.post.upsert({
    where: { title: "First Post" },
    update: {},
    create: {
      title: "First Post",
      content: "This is the first sample post.",
      category: "Tech",
      published: true,
      authorId: user1.id,
    },
  });

  const post2 = await prisma.post.upsert({
    where: { title: "Second Post" },
    update: {},
    create: {
      title: "Second Post",
      content: "Another post for testing.",
      category: "Lifestyle",
      published: false,
      authorId: user2.id,
    },
  });

  const post3 = await prisma.post.upsert({
    where: { title: "Third Post" },
    update: {},
    create: {
      title: "Third Post",
      content: "Learning Prisma is fun!",
      category: "Tech",
      published: true,
      authorId: user1.id,
    },
  });


  await prisma.comment.createMany({
    data: [
      { content: "Great post!", postId: post1.id, userId: user2.id },
      { content: "Thanks for sharing!", postId: post1.id, userId: user1.id },
      { content: "Interesting read!", postId: post3.id, userId: user2.id },
    ],
    skipDuplicates: true,
  });


  await prisma.like.createMany({
    data: [
      { postId: post1.id, userId: user2.id },
      { postId: post1.id, userId: user1.id },
      { postId: post3.id, userId: user2.id },
    ],
    skipDuplicates: true,
  });

  console.log("Seed data (users, posts, comments, likes) inserted successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
