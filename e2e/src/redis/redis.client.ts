/** biome-ignore-all lint/style/noNonNullAssertion: This env variables will exist */
import Redis from "ioredis";

export const RedisClient = new Redis({
    host: process.env.REDIS_HOST!,
    port: +process.env.REDIS_PORT!
});
