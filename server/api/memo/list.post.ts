import prisma from "~/lib/db";

type ListMemoReq = {
  page: number;
};

export default defineEventHandler(async (event) => {
  const { page } = (await readBody(event)) as ListMemoReq;
  const size = 10;
  let data = await prisma.memo.findMany({
    include: {
      user: {
        select: {
          username: true,
          nickname: true,
          slogan: true,
          id: true,
          avatarUrl: true,
          coverUrl: true,
        },
      },
      comments: {
        orderBy: {
          createdAt: "asc",
        },
        take: 5+1
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
    where: {
      pinned: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * size,
    take: size,
  });
  if (page === 1) {
    const pinnedMemo = await prisma.memo.findFirst({
      include: {
        user: {
          select: {
            username: true,
            nickname: true,
            slogan: true,
            id: true,
            avatarUrl: true,
            coverUrl: true,
          },
        },
        comments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5+1
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      where: {
        pinned: true,
      },
    });
    if (pinnedMemo) {
      // @ts-ignore
      data = [pinnedMemo, ...data];
    }
  }
  data = data.map(memo => ({
    ...memo,
    comments: memo.comments.filter(comment => comment.content && comment.content.length < 100),
    hasMoreComments: memo._count.comments > 5 || memo.comments.some(comment => comment.content && comment.content.length >= 100),
  }));
  const total = await prisma.memo.count();
  const totalPage = Math.ceil(total / size);
  return {
    data,
    hasNext: page < totalPage,
    success: true,
  };
});
