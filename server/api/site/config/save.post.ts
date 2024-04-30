import prisma from "~/lib/db";
import bcrypt from "bcrypt";

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
};

export default defineEventHandler(async (event) => {
    const data = (await readBody(event)) as SaveConfigsReq;

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
        },
    });

    return {
        success: true,
    };

});
