import prisma from "~/lib/db";
import { readBody } from "h3";
import { sendEmail } from '~/utils/sendEmail';
import RPCClient from '@alicloud/pop-core';

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
    // 文本内容检查
    if(process.env.ALIYUN_ACCESS_KEY_ID === undefined || process.env.ALIYUN_ACCESS_KEY_ID === '' || process.env.ALIYUN_ACCESS_KEY_ID === 'undefined' || process.env.ALIYUN_ACCESS_KEY_ID === 'null' ||
        process.env.ALIYUN_ACCESS_KEY_SECRET === undefined || process.env.ALIYUN_ACCESS_KEY_SECRET === '' || process.env.ALIYUN_ACCESS_KEY_SECRET === 'undefined' || process.env.ALIYUN_ACCESS_KEY_SECRET === 'null'){
        const aliJudgeResponse = await aliTextJudge(content);
        if (aliJudgeResponse.Data && aliJudgeResponse.Data.reason) {
            const reason = JSON.parse(aliJudgeResponse.Data.reason);
            if (reason.riskTips) {
                return {
                    success: false,
                    message: "评论内容不符合规范，原因：" + reason.riskTips,
                };
            }
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

// 阿里云文本审核
async function aliTextJudge(content: string) {
    // 注意，此处实例化的client请尽可能重复使用，避免重复建立连接，提升检测性能。
    let client = new RPCClient({
        /**
         * 阿里云账号AccessKey拥有所有API的访问权限，建议您使用RAM用户进行API访问或日常运维。
         * 强烈建议不要把AccessKey ID和AccessKey Secret保存到工程代码里，否则可能导致AccessKey泄露，威胁您账号下所有资源的安全。
         * 常见获取环境变量方式：
         * 获取RAM用户AccessKey ID：process.env['ALIBABA_CLOUD_ACCESS_KEY_ID']
         * 获取RAM用户AccessKey Secret：process.env['ALIBABA_CLOUD_ACCESS_KEY_SECRET']
         */
        accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
        accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
        // 接入区域和地址请根据实际情况修改
        endpoint: "https://green-cip.cn-shanghai.aliyuncs.com",
        apiVersion: '2022-03-02',
        // 设置http代理
        // httpProxy: "http://xx.xx.xx.xx:xxxx",
        // 设置https代理
        // httpsProxy: "https://username:password@xxx.xxx.xxx.xxx:9999",
    });
    // 通过以下代码创建API请求并设置参数。
    const params = {
        // 文本检测service：内容安全控制台文本增强版规则配置的serviceCode，示例：chat_detection
        "Service": "comment_detection",
        "ServiceParameters": JSON.stringify({
            //待检测文本内容。
            "content": content,
        }),
    };

    const requestOption = {
        method: 'POST',
        formatParams: false,
    };

    let response; // 将response的声明移动到这里
    try {
        response = await client.request('TextModeration', params, requestOption);
        if (response.Code === 500) {
            client.endpoint = "https://green-cip.cn-beijing.aliyuncs.com";
            response = await client.request('TextModeration', params, requestOption);
        }
    } catch (err) {
        console.log(err);
        // 确保在错误情况下也返回一个值，或者抛出一个错误
        return err;
    }
    return response;
}