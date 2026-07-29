import { mock } from "bun:test";
import type RedisAdapter from "ioredis";

export function createRedisMock() {
    return {
        eval: mock<RedisAdapter["eval"]>(() => Promise.resolve(null))
    };
}
