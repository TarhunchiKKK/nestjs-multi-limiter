import { mock } from "bun:test";
import type { IRedisAdapter } from "../../../src";

export function createRedisMock() {
    return {
        eval: mock<IRedisAdapter["eval"]>(() => Promise.resolve(null)),
        handleError: mock<NonNullable<IRedisAdapter["handleError"]>>(() => {})
    };
}
