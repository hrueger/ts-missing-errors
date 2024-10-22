import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function testTypePayloadForPost(
    post: Prisma.PostGetPayload<{
        include: {
            user: {
                include: {
                    profile: {
                        select: {
                            description: true;
                        };
                    };
                };
            };
        };
    }>
) {
    if (post.user.profile !== null) {
        console.log(post.user.profile.description);
    }
}

function testTypePayloadForUser(
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
    if (user.profile !== null) {
        console.log(user.profile.description);
    }
}

async function main() {
    // Clear db
    await prisma.user.deleteMany({});
    await prisma.profile.deleteMany({});
    await prisma.post.deleteMany({});

    // Create test user
    await prisma.user.create({
        data: {
            id: "1",
            name: "first user",
            profile: {
                create: {
                    id: "1",
                    age: 22,
                    description: "hello world",
                },
            },
            posts: {
                create: [
                    {
                        id: "1",
                        title: "my post",
                        content: "my content",
                    },
                ],
            },
        },
    });

    const post = await prisma.post.findUnique({
        where: {
            id: "1",
        },
        include: {
            user: {
                include: {
                    profile: {
                        select: {
                            description: false,
                            age: true,
                        },
                    },
                },
            },
        },
    });
    if (post === null) {
        console.error("something went wrong");
        return;
    }

    // NO TS LINTING ERROR - SHOULD BE
    testTypePayloadForPost(post);

    // TS LINTING ERROR - EXPECTED
    testTypePayloadForUser(post.user);
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
