
export default defineEventHandler(async (event) => {
    const data = {
        id: event.context.userId || 0,
    };

    return {
        success: true,data
    };
});
