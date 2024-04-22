import prisma from "~/lib/db";

export default defineEventHandler(async (event) => {
  const data = await prisma.user.findUnique({
    where: {
      id: 1,
    },
  });
  if(!data){
    throw new Error("User not found");
  }
  // 将data中的敏感信息过滤掉
  data.password = "";
  return {
    success: true,data
  };
});
