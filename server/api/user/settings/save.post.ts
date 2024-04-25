import prisma from "~/lib/db";
import bcrypt from "bcrypt";

type SaveSettingsReq = {
  password?: string;
  nickname?: string;
  avatarUrl?: string;
  slogan?: string;
  coverUrl?: string;
  enableS3: boolean;
  domain: string;
  bucket: string;
  region: string;
  accessKey: string;
  secretKey: string;
  endpoint: string;
  thumbnailSuffix: string;
  title: string;
  favicon: string;
  css:string;
  js:string;
  beianNo:string;
};

export default defineEventHandler(async (event) => {
  const { password, nickname, avatarUrl, slogan, coverUrl, ...rest } =
    (await readBody(event)) as SaveSettingsReq;

  const updated = {} as SaveSettingsReq;

    const userId = event.context.userId;


  if (password) updated.password = bcrypt.hashSync(password, 10);
  updated.nickname = nickname || "Jerry";
  updated.avatarUrl =
    avatarUrl ||
    "https://images.kingwrcy.cn/memo/20240386211829TtcOUOMaXyITlTkxhSjp";
  updated.slogan = slogan || "星垂平野阔，月涌大江流。";
  updated.coverUrl =
    coverUrl ||
    "https://images.unsplash.com/photo-1711299253442-de19d4dacaae?q=80&w=3500&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  // 从updated中获取剩余的数据
  const data = { ...updated, ...rest };

  console.log(data);



  // 将username，nickname，password，avatarUrl，slogan，coverUrl 更新到user表中，剩下到数据更新到config表中

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
        username: data.nickname,
        nickname: data.nickname,
        password: data.password,
        avatarUrl: data.avatarUrl,
        slogan: data.slogan,
        coverUrl: data.coverUrl,
    },
  });


  await prisma.config.update({
    where: {
      id: 1,
    },
    data: {
      enableS3: data.enableS3,
      s3Domain: data.domain,
        s3Bucket: data.bucket,
        s3Region: data.region,
        s3AccessKey: data.accessKey,
        s3SecretKey: data.secretKey,
        s3Endpoint: data.endpoint,
        s3ThumbnailSuffix: data.thumbnailSuffix,
      favicon: data.favicon,
        title: data.title,
        css: data.css,
        js: data.js,
        beianNo: data.beianNo,
    }
  });
  return {
    success: true,
  };

});
