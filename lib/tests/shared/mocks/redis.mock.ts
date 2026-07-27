import { mock } from "bun:test";
import type RedisStorage from "ioredis";

export function createRedisMock() {
    return {
        eval: mock<RedisStorage["eval"]>(() => Promise.resolve(null))
    };
}
