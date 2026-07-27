import Redis from "ioredis";

export function createRedisClient() {
    return new Redis({
        host: "localhost",
        port: 6379
    });
}
