import prisma from "~/lib/db";
import { readBody } from "h3";
import { sendEmail } from '~/utils/sendEmail';

// 定义评论请求的数据类型
type SaveCommentReq = {
    memoId: number;
    content: string;
    replyTo?: string;
    replyToId?: number;
    email?: string;
    website?: string;
    username: string;
    author: Boolean;
    reToken: string;
};

export default defineEventHandler(async (event) => {
    // 从请求体中读取数据
    const { memoId, content, replyTo, replyToId, username, email, website, reToken } =
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

    // 判断字符长度是否大于500
    if (content.length > 500) {
        return {
            success: false,
            message: "评论内容长度不能超过500个字符",
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
    let flag = true;
    if(replyToId !== undefined && replyToId !== 0){
        const comment = await prisma.comment.findUnique({
            where: {
                id: replyToId,
            }
        });
        if(comment !== null && comment.email !== null && comment.email !== ''){
            if(comment.email === process.env.NOTIFY_MAIL){
                flag = false;
            }
            // 邮箱通知被回复者
            const result = await sendEmail({
                email: comment.email,
                subject: '新回复',
                message: `您在moments中的评论有新回复！
                用户名为： ${username} 回复了您的评论(${comment.content})，他回复道：${content}，点击查看：${process.env.SITE_URL}/detail/${memoId}`,
            });
        }
    }

    // 非管理员
    if(event.context.userId == undefined && flag){
        // 判断process.env.SITE_URL是否以/结尾，如果是则去掉
        let siteUrl = process.env.SITE_URL;
        if(siteUrl === undefined || siteUrl === '' || siteUrl === 'undefined' || siteUrl === 'null'){
            siteUrl = '';
        }
        if(siteUrl.endsWith('/')){
            siteUrl = siteUrl.slice(0, -1);
        }

        // 邮箱通知管理员
        const result = await sendEmail({
            email: process.env.NOTIFY_MAIL || '',
            subject: '新评论',
            message: `您的moments有新评论！
            用户名为： ${username} 在您的moment中发表了评论：${content}，点击查看：${siteUrl}/detail/${memoId}`,
        });
    }

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
