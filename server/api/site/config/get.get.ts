import prisma from "~/lib/db";

export default defineEventHandler(async (event) => {
    let data = await prisma.config.findUnique({
        where: {
            id: 1,
        },
    });

    if(!data){
        throw new Error("Info not found");
    }
    if(event.context.userId == 1){
        return {
            success: true,data
        };
    }
    return {
        success: true, data: {
            enableS3: data.enableS3,
            enableRecaptcha: data.enableRecaptcha,
            recaptchaSiteKey: data.recaptchaSiteKey,
            enableTencentMap: data.enableTencentMap,
            tencentMapKey: data.tencentMapKey,
        }
    }
});
