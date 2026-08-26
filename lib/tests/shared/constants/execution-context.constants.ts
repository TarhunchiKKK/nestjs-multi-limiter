import type { ExecutionContext } from "@nestjs/common";

export const EXECUTION_CONTEXT = {
    getHandler: () => ({}),
    getClass: () => ({})
} as unknown as ExecutionContext;
