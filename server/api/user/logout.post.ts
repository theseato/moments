import prisma from "~/lib/db";
import redis from "~/services/redisService";

export default defineEventHandler(async (event) => {
    // 获取当前用户的id
    const token = event.context.token;
    // 删除redis中的token
    await redis.del(token);
});
