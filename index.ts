import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function TestFunction(
  user: Prisma.UserGetPayload<{
    include: {
      profile: {
        select: {
          description: true;
        };
      };
    };
  }>
) {
  // Here we would expect that IF the description does exist, it should
  // contain a description... but it does not
  if (user.profile !== null) {
    console.log(user.profile?.description);
  }
}

async function main() {
  // Clear db
  await prisma.user.delete({
    where: {
      id: "1",
    },
  });
  await prisma.profile.delete({
    where: {
      id: "1",
    },
  });

  // Create test user
  await prisma.user.create({
    data: {
      id: "1",
      name: "first user",
      profile: {
        create: {
          id: "1",
          age: 22,
        },
      },
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      id: "1",
    },
    include: {
      profile: {
        select: {
          description: true,
        },
      },
    },
  });
  if (user === null) {
    console.error("something went wrong");
    return;
  }

  TestFunction(user);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })

  .catch(async (e) => {
    console.error(e);

    await prisma.$disconnect();

    process.exit(1);
  });
