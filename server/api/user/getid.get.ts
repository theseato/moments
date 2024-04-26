
export default defineEventHandler(async (event) => {
    const data = {
        id: event.context.userId,
    };

    return {
        success: true,data
    };
});
