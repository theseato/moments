import Redis from 'ioredis';

const redis = new Redis({
    host: process.env.REDIS_HOST? process.env.REDIS_HOST : 'localhost',
    port: parseInt(process.env.REDIS_PORT? process.env.REDIS_PORT : '6379'),
    password: process.env.REDIS_PASSWORD? process.env.REDIS_PASSWORD : '',
    db: parseInt(process.env.REDIS_DATABASE? process.env.REDIS_DATABASE : '0')
});

export default redis;
