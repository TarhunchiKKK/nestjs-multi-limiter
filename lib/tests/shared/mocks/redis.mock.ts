import { mock } from "bun:test";
import type IRedisAdapter from "ioredis";

export function createRedisMock() {
    return {
        eval: mock<IRedisAdapter["eval"]>(() => Promise.resolve(null))
    };
}
