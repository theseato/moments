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
    retoken: string;
};

// 此处填写你的 Google reCAPTCHA 私钥
const secret = "YOUR_SECRET_KEY";

export default defineEventHandler(async (event) => {
    // 从请求体中读取数据
    const { memoId, content, replyTo, username, email, website, retoken } =
        (await readBody(event)) as SaveCommentReq;

    // 验证 reCAPTCHA 响应
    const recaptchaResult = await validateRecaptcha(retoken);
    if (!recaptchaResult.success) {
        return {
            success: false,
            message: "reCAPTCHA failed：" + recaptchaResult["error-codes"].join(", ")
        };
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
async function validateRecaptcha(retoken) {
    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `secret=${secret}&response=${retoken}`
        });
        return await response.json();
    } catch (error) {
        console.error("Failed to verify reCAPTCHA:", error);
        return { success: false, "error-codes": ["verification_failed"] };
    }
}
