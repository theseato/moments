import prisma from "~/lib/db";

type GetSettingReq = {
  user?: string;
};

export default defineEventHandler(async (event) => {
  const url = new URL(event.req.url, `http://${event.req.headers.host}`);
  const params = new URLSearchParams(url.search);

  // 获取用户 ID，如果没有提供则默认为 1
  let userId = parseInt(params.get('user'));

  if (!userId || userId < 1) {
    userId = event.context.userId;
  }

  userId = userId ? userId : 1;

  let userData = null
  if(event.context.userId !== userId) {
    userData = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        nickname: true,
        avatarUrl: true,
        slogan: true,
        coverUrl: true,
      },
    });
  }else{
    userData = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        nickname: true,
        avatarUrl: true,
        slogan: true,
        coverUrl: true,
        eMail: true,
      },
    });
  }
  const configData = await prisma.config.findUnique({
    where: {
      id: 1,
    },
    select: {
      favicon: true,
      title: true,
      css:true,
      js:true,
      beianNo:true,
    },
  });
  if (!userData || !configData) {
    throw new Error("User not found");
  }
  const data = { ...userData, ...configData };
  return {
    success: true,
    data: data,
  };
});
