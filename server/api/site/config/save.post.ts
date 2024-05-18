import prisma from "~/lib/db";
import bcrypt from "bcrypt";
import {context} from "esbuild";

type SaveConfigsReq = {
    enableS3: boolean,
    domain?: string,
    bucket?: string,
    region?: string,
    accessKey?: string,
    secretKey?: string,
    endpoint?: string,
    thumbnailSuffix?: string,
    title?: string,
    favicon?: string,
    css?: string,
    js?: string,
    beianNo?: string,
    siteUrl?: string,
    enableRecaptcha?: boolean,
    recaptchaSiteKey?: string,
    recaptchaSecretKey?: string,
    enableTencentMap?: boolean,
    tencentMapKey?: string,
    enableAliyunDective?: boolean,
    aliyunAccessKeyId?: string,
    aliyunAccessKeySecret?: string,
    enableEmail?: boolean,
    mailHost?: string,
    mailPort?: number,
    mailSecure?: boolean,
    mailUser?: string,
    mailPass?: string,
    mailFrom?: string,
    mailName?: string,
    notification?: string,
};

export default defineEventHandler(async (event) => {
    const data = (await readBody(event)) as SaveConfigsReq;

    if(event.context.userId !== 1){
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized",
        });
    }

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
            title: data.title,
            favicon: data.favicon,
            css: data.css,
            js: data.js,
            beianNo: data.beianNo,
            siteUrl: data.siteUrl,
            enableRecaptcha: data.enableRecaptcha,
            recaptchaSiteKey: data.recaptchaSiteKey,
            recaptchaSecretKey: data.recaptchaSecretKey,
            enableTencentMap: data.enableTencentMap,
            tencentMapKey: data.tencentMapKey,
            enableAliyunDective: data.enableAliyunDective,
            aliyunAccessKeyId: data.aliyunAccessKeyId,
            aliyunAccessKeySecret: data.aliyunAccessKeySecret,
            enableEmail: data.enableEmail,
            mailHost: data.mailHost,
            mailPort: data.mailPort,
            mailSecure: data.mailSecure,
            mailUser: data.mailUser,
            mailPass: data.mailPass,
            mailFrom: data.mailFrom,
            mailName: data.mailName,
        },
    });

    const notificationRecord = await prisma.notification.findFirst({
        where: {
            type: 2,
        },
    });

    if(notificationRecord){
        await prisma.notification.update({
            where: {
                id: notificationRecord.id,
            },
            data: {
                message: data.notification,
            },
        });
    }else{
        await prisma.notification.create({
            data: {
                type: 2,
                message: data.notification,
            },
        });
    }

    return {
        success: true,
    };

});
