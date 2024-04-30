import prisma from "~/lib/db";
import { sendEmail } from '~/utils/sendEmail';
import {fa} from "cronstrue/dist/i18n/locales/fa";
import redis from '~/services/redisService';

type sendMailReq = {
    email: string;
    action: string;
};

export default defineEventHandler(async (event) => {
    const {email, action} = (await readBody(event)) as sendMailReq;

    // 判断参数是否正确
    if(!['register','resetPassword','changeEmail'].includes(action)){
        return {
            success: false,
            message: "参数错误",
        };
    }

    if (!email) {
        return {
            success: false,
            message: "邮箱不能为空",
        };
    }else if(!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(email)){
        return {
            success: false,
            message: "邮箱格式不正确",
        };
    }

    // 生成验证码
    const verificationCode = generateVerificationCode();

    if(await redis.get(action+email)){
        return { success: false, message: '上一条验证码还未过期，请五分钟后再试' };
    }

    // 从数据库中读取title
    const title = await prisma.config.findUnique({
        where: {
            id: 1,
        },
        select: {
            title: true,
        },
    });

    // 发送验证码邮件
    const sendData = {
        email: email,
        subject: title.title==='undefined'?'验证码':title.title+'验证码',
        message: `您的验证码是：${verificationCode}，五分钟内有效，五分钟内请勿重新尝试发送。`,
    };
    // 发送邮件
    await sendEmail(sendData);
    await redis.set(action+email, verificationCode, 'EX', 5 * 60);
    return { success: true, message: '验证码已发送至您的邮箱，验证码五分钟内有效，请注意查收' };

});



function generateVerificationCode() {
    const length = 6;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
}
