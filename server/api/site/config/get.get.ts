import prisma from "~/lib/db";

export default defineEventHandler(async (event) => {
    let data = await prisma.config.findUnique({
        where: {
            id: 1,
        },
    });

    if(!data){
        throw new Error("User not found");
    }
    return {
        success: true,data
    };
});
