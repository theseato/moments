import prisma from "~/lib/db";

type ListMemoReq = {
  find: any;
  withMe: number;
};

export default defineEventHandler(async (event) => {
  let { find, withMe } = (await readBody(event)) as ListMemoReq;

  // const size = 10;
  let data :any = [];
  if(withMe == 0){
    data = await prisma.user.findMany({
      where:{
        nickname: {
          contains: find,
        },
        id:{
          not:event.context.userId
        }
      },
      select:{
        id: true,
        nickname: true,
        avatarUrl: true,
      },
    });
  }else if(withMe == 1){
    data = await prisma.user.findMany({
      where:{
        nickname: {
          contains: find,
        },
      },
      select:{
        id: true,
        nickname: true,
        avatarUrl: true,
      },
    });
  }


  // const total = await prisma.user.count({
  //   where:{
  //     nickname: {
  //       contains: find,
  //     }
  //   }
  // });
  // const totalPage = Math.ceil(total / size);
  return {
    data,
    // hasNext: page < totalPage,
    success: true,
  };
});
