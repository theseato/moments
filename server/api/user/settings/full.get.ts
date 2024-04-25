import prisma from "~/lib/db";

export default defineEventHandler(async (event) => {
  const data1 = await prisma.user.findUnique({
    where: {
      id: event.context.userId,
    },
    select: {
        username: true,
        nickname: true,
        avatarUrl: true,
        slogan: true,
        coverUrl: true,
        },
  });
  const data2 = await prisma.config.findUnique({
    where: {
      id: 1,
    },
  });
  data2.configId = data2.id;
    data2.domain = data2.s3Domain;
    data2.bucket = data2.s3Bucket;
    data2.region = data2.s3Region;
    data2.accessKey = data2.s3AccessKey;
    data2.secretKey = data2.s3SecretKey;
    data2.endpoint = data2.s3Endpoint;
    data2.thumbnailSuffix = data2.s3ThumbnailSuffix;
    delete data2.id;
    delete data2.s3Domain;
    delete data2.s3Bucket;
    delete data2.s3Region;
    delete data2.s3AccessKey;
    delete data2.s3SecretKey;
    delete data2.s3Endpoint;
    delete data2.s3ThumbnailSuffix;


  if(!data1 || !data2){
    throw new Error("User not found");
  }
  return {
    success: true,data:{...data1,...data2}
  };
});
