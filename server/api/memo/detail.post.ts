import prisma from "~/lib/db";

type DetailMemoReq = {
  id: number;
};

export default defineEventHandler(async (event) => {
  const { id } = (await readBody(event)) as DetailMemoReq;
  const data = await prisma.memo.findUnique({
    where:{
      id
    },
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
      },
      _count: {
        select:{
          comments:true
        }
      }
    },    
  });
  if(data && data.availableForProple !== '' && data.availableForProple !== null){
    const info = data.availableForProple.split(',');
    if(info.includes(event.context.userId)) {
      return {
        data,
        success: true,
      };
    }else{
        return {
            success: false,
            message: "401 Unauthorized 未授权查看该内容，请登陆或者联系作者获取权限",
        };
    }
  }
  return {
    data,
    success: true,
  };
});
