import { mock } from "bun:test";
import type { Reflector } from "@nestjs/core";

export function createReflectorMock() {
    return {
        get: mock(() => {}) satisfies Reflector["get"]
    };
}
