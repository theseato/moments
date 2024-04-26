import prisma from "~/lib/db";

type RemoveCommentReq = {
  commentId: number;
};

export default defineEventHandler(async (event) => {
  const { commentId } =
    (await readBody(event)) as RemoveCommentReq;

  // 根据commentId查找所在memo，然后查找所属用户
    const comment = await prisma.comment.findUnique({
        where: {
        id: commentId,
        },
        select: {
        memoId: true,
        },
    });
    if(comment){
      const memo = await prisma.memo.findUnique({
          where: {
          id: comment.memoId,
          },
          select: {
          userId: true,
          },
      });
        if(memo && (memo?.userId !== event.context.userId)){
            throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized",
            });
        }
    }


  await prisma.comment.delete({
    where: {
      id:commentId,
    },
  });
  return {
    success: true
  };
});
