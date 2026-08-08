import { mock } from "bun:test";
import type { Reflector } from "@nestjs/core";

export function createReflectorMock() {
    return {
        getAllAndOverride: mock<Reflector["getAllAndOverride"]>(() => {})
    };
}
