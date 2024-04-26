import prisma from "~/lib/db";

export default defineEventHandler(async (event) => {
  let data = await prisma.user.findUnique({
    where: {
      id: event.context.userId,
    },
  });

  if(!data){
    throw new Error("User not found");
  }else{
      data.password = '';
  }
  return {
    success: true,data
  };
});
