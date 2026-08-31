import type { ExecutionContext } from "@nestjs/common";
import { REQUEST_CONTEXT_ID } from "@nestjs/core/internal";
import { randomUUIDv7 } from "bun";

export const MOCK_CONTEXT_ID = randomUUIDv7();

export const EXECUTION_CONTEXT = {
    getHandler: () => ({}),
    getClass: () => ({}),
    getType: () => "http",
    switchToHttp: () => ({
        getRequest: () => ({
            [REQUEST_CONTEXT_ID]: MOCK_CONTEXT_ID
        })
    })
} as unknown as ExecutionContext;
