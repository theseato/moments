const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '1000', 10); // 默认为1000毫秒
const rateLimitMaxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5', 10); // 默认为每秒5次请求


interface RateLimitInfo {
    hits: number;
    resetTime: number;
}

const rateLimits: Record<string, RateLimitInfo> = {};

export default defineEventHandler((event) => {
    const ip = event.req.socket.remoteAddress || 'unknown_ip';

    const currentLimit = rateLimits[ip] || {
        hits: 0,
        resetTime: Date.now() + rateLimitWindowMs
    };

    // 检查时间窗口是否已过期，如果是，重置
    if (currentLimit.resetTime <= Date.now()) {
        currentLimit.hits = 1;
        currentLimit.resetTime = Date.now() + rateLimitWindowMs;
        rateLimits[ip] = currentLimit;
    } else {
        // 时间窗口尚未过期，增加命中次数
        currentLimit.hits += 1;
        rateLimits[ip] = currentLimit;

        if (currentLimit.hits > rateLimitMaxRequests) {
            // 如果超过了限制，抛出429错误
            throw createError({
                statusCode: 429,
                statusMessage: "Too many requests, please try again later."
            });
        }
    }
});
