import prisma from "~/lib/db";
import { readBody } from "h3";
import { sendEmail } from '~/utils/sendEmail';
import { aliTextJudge } from '~/utils/aliTextJudge';


// 定义评论请求的数据类型
type SaveCommentReq = {
    memoId: number;
    content: string;
    replyTo?: string;
    replyToId?: number;
    email?: string;
    website?: string;
    username: string;
    author: number;
    reToken: string;
};

const staticWord = {
    'ad': '广告引流',
    'political_content': '涉政内容',
    'profanity': '辱骂内容',
    'contraband': '违禁内容',
    'sexual_content': '色情内容',
    'violence': '暴恐内容',
    'nonsense': '无意义内容',
    'negative_content': '不良内容',
    'religion': '宗教内容',
    'cyberbullying': '网络暴力',
    'ad_compliance': '广告法合规',
    'C_customized': '违反本站规定',
}

export default defineEventHandler(async (event) => {
    // 从请求体中读取数据
    const { memoId, content, replyTo, replyToId, username, email, website, reToken } =
        (await readBody(event)) as SaveCommentReq;

    if (content.length > 500) {
        return { success: false, message: "评论内容长度不能超过500个字符",};
    }
    if (username.length > 10) {
        return { success: false, message: "用户名长度不能超过8个字符" };
    }
    if (email && email.length > 30) {
        return { success: false, message: "邮箱长度不能超过30个字符" };
    }
    if (website && website.length > 100) {
        return { success: false, message: "网址长度不能超过100个字符" };
    }
    if (email && !/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(email)) {
        return { success: false, message: "邮箱格式不正确" };
    }
    if (website && !/^(https?:\/\/)?[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(website)) {
        return { success: false, message: "网址格式不正确" };
    }

    if(process.env.RECAPTCHA_SITE_KEY === undefined || process.env.RECAPTCHA_SITE_KEY === '' || process.env.RECAPTCHA_SITE_KEY === 'undefined' || process.env.RECAPTCHA_SITE_KEY === 'null' ||
        process.env.RECAPTCHA_SECRET_KEY === undefined || process.env.RECAPTCHA_SECRET_KEY === '' || process.env.RECAPTCHA_SECRET_KEY === 'undefined' || process.env.RECAPTCHA_SECRET_KEY === 'null'){

    }else{
        // 验证 reCAPTCHA 响应
        const recaptchaResult = await validateRecaptcha(reToken);
        if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
            return {
                success: false,
                message: "reCAPTCHA failed: " + recaptchaResult["error-codes"].join(", ")
            };
        }
    }

    // 文本内容检查
    if(process.env.ALIYUN_ACCESS_KEY_ID === undefined || process.env.ALIYUN_ACCESS_KEY_ID === '' || process.env.ALIYUN_ACCESS_KEY_ID === 'undefined' || process.env.ALIYUN_ACCESS_KEY_ID === 'null' ||
        process.env.ALIYUN_ACCESS_KEY_SECRET === undefined || process.env.ALIYUN_ACCESS_KEY_SECRET === '' || process.env.ALIYUN_ACCESS_KEY_SECRET === 'undefined' || process.env.ALIYUN_ACCESS_KEY_SECRET === 'null'){

    }else{
        const aliJudgeResponse1 = await aliTextJudge(content, 'comment_detection');
        if (aliJudgeResponse1.Data && aliJudgeResponse1.Data.labels && aliJudgeResponse1.Data.labels !== '') {
            let labelsList = aliJudgeResponse1.Data.labels.split(',');

            return {
                success: false,
                message: "评论内容不符合规范：" + labelsList.map((label: string) => staticWord[label]).join(', '),
            };
        }

        const aliJudgeResponse2 = await aliTextJudge(username, 'nickname_detection');
        if (aliJudgeResponse2.Data && aliJudgeResponse2.Data.labels && aliJudgeResponse2.Data.labels !== '') {
            let labelsList = aliJudgeResponse2.Data.labels.split(',');

            return {
                success: false,
                message: "用户名不符合规范：" + labelsList.map((label: string) => staticWord[label]).join(', '),
            };
        }

    }

    // 根据memoId查找memo的作者
    const memo = await prisma.memo.findUnique({
        where: {
            id: memoId,
        },
        select: {
            userId: true,
        },
    });
    // 创建评论
    await prisma.comment.create({
        data: {
            content,
            replyTo,
            memoId,
            username,
            email,
            website,
            author: event.context.userId !== undefined? (event.context.userId === memo?.userId? 1: 2): 0,
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
            const result = sendEmail({
                email: comment.email,
                subject: '新回复',
                message: `您在moments中的评论有新回复！
                用户名为:  ${username} 回复了您的评论(${comment.content})，他回复道: ${content}，点击查看: ${process.env.SITE_URL}/detail/${memoId}`,
            });
        }
    }

    // 非管理员
    if(event.context.userId == undefined && flag){
        // 找到文章所有者的邮箱
        const user = await prisma.user.findUnique({
            where: {
                id: memo?.userId,
            },
            select: {
                eMail: true,
            },
        });
        // 判断process.env.SITE_URL是否以/结尾，如果是则去掉
        let siteUrl = process.env.SITE_URL;
        if(siteUrl === undefined || siteUrl === '' || siteUrl === 'undefined' || siteUrl === 'null'){
            siteUrl = '';
        }
        if(siteUrl.endsWith('/')){
            siteUrl = siteUrl.slice(0, -1);
        }

        // 邮箱通知管理员
        const result = sendEmail({
            email: user.eMail || process.env.NOTIFY_MAIL || '',
            subject: '新评论',
            message: `您的moments有新评论！
            用户名为:  ${username} 在您的moment中发表了评论: ${content}，点击查看: ${siteUrl}/detail/${memoId}`,
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
