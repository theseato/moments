import prisma from "~/lib/db";
import bcrypt from "bcrypt";

type SaveSettingsReq = {
  username?: string,
  password?: string,
  nickname?: string,
  slogan?: string,
  avatarUrl?: string,
  coverUrl?: string,
  css?: string,
  js?: string,
};

export default defineEventHandler(async (event) => {
  const {username,  password, nickname, avatarUrl, slogan, coverUrl, ...rest } =
    (await readBody(event)) as SaveSettingsReq;

  const updated = {} as SaveSettingsReq;

    const userId = event.context.userId;


  if (password) updated.password = bcrypt.hashSync(password, 10);
  updated.nickname = nickname || "无名侠士";
  updated.avatarUrl = avatarUrl || '/avatar.webp'
  updated.slogan = slogan || "星垂平野阔，月涌大江流。";
  updated.coverUrl = coverUrl || '/cover.webp';

  if(username){
    const userExist = await prisma.user.findFirst({
      where: {
        username: username,
        id: {
            not: userId,
        }
      },
    });
    if (userExist) {
      return {
        success: false,
        message: "用户名已存在",
      };
    }
    updated.username = username;
  }

  // 从updated中获取剩余的数据
  const data = { ...updated, ...rest };

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
        username: data.username,
        nickname: data.nickname,
        password: data.password,
        avatarUrl: data.avatarUrl,
        slogan: data.slogan,
        coverUrl: data.coverUrl,
    },
  });

  return {
    success: true,
  };

});
