import prisma from "~/lib/db";
import { readBody } from "h3";

// 定义评论请求的数据类型
type SaveCommentReq = {
    memoId: number;
    content: string;
    replyTo?: string;
    email?: string;
    website?: string;
    username: string;
    author: Boolean;
    reToken: string;
};

export default defineEventHandler(async (event) => {
    // 从请求体中读取数据
    const { memoId, content, replyTo, username, email, website, reToken } =
        (await readBody(event)) as SaveCommentReq;

    if(process.env.RECAPTCHA_SITE_KEY === undefined || process.env.RECAPTCHA_SITE_KEY === '' || process.env.RECAPTCHA_SITE_KEY === 'undefined' || process.env.RECAPTCHA_SITE_KEY === 'null' ||
        process.env.RECAPTCHA_SECRET_KEY === undefined || process.env.RECAPTCHA_SECRET_KEY === '' || process.env.RECAPTCHA_SECRET_KEY === 'undefined' || process.env.RECAPTCHA_SECRET_KEY === 'null'){

    }else{
        // 验证 reCAPTCHA 响应
        const recaptchaResult = await validateRecaptcha(reToken);
        if (!recaptchaResult.success) {
            return {
                success: false,
                message: "reCAPTCHA failed：" + recaptchaResult["error-codes"].join(", ")
            };
        }
    }

    // 创建评论
    await prisma.comment.create({
        data: {
            content,
            replyTo,
            memoId,
            username,
            email,
            website,
            author: event.context.userId !== undefined
        },
    });

    // 返回成功响应
    return {
        success: true,
    };
});

// reCAPTCHA 验证函数
async function validateRecaptcha(reToken: string) {
    try {
        const response = await fetch('https://recaptcha.net/recaptcha/api/siteverify', {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${reToken}`
        });
        return await response.json();
    } catch (error) {
        console.error("Failed to verify reCAPTCHA:", error);
        return { success: false, "error-codes": ["verification_failed"] };
    }
}
