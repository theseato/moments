import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtKey } from "~/lib/constant";
import prisma from "~/lib/db";

type loginReq = {
  username: string;
  password: string;
};

export type JwtPayload = {
  username: string;
  exp: number;
  userId: number;
};

export default defineEventHandler(async (event) => {
  const {username,password} = (await readBody(event)) as loginReq;
  let token = "";
  if (!username || !password) {
    return {
      success: false,
      message: "用户名（邮箱）或密码不能为空",
      token,
    };
  }

  // 查找邮箱或者用户名
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          username: username,
        },
        {
          eMail: username,
        },
      ],
    },
  });

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return {
      message: "用户名（邮箱）或密码错误",
      success: false,
      token,
    };
  }

  token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        username: user.username,
        userId: user.id,
      },
      jwtKey
  );
  setCookie(event, "token", token, {
    expires: new Date(Date.now() + 60 * 60 * 24 * 1000),
  });
  setCookie(event, "userId", ''+user.id, {
    expires: new Date(Date.now() + 60 * 60 * 24 * 1000),
  });

  return {
    success: true,
    userinfo: {
      username: user.username,
      userId: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      slogan: user.slogan,
      coverUrl: user.coverUrl,
      favicon: user.favicon,
      title: user.title,
      css: user.css,
      js: user.js,
    },
    message:""
  };
});
