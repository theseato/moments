import Redis from 'ioredis';

const redis = new Redis({
    host: 'localhost',  // Redis 服务器地址
    port: 6379,         // Redis 服务器端口，默认是 6379
    password: '',  // 如果你的 Redis 服务器设置了密码
    db: 7               // 如果你要使用不同的数据库
});

export default redis;