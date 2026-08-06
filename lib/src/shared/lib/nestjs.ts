import type { InjectionToken } from "@nestjs/common";

export type TokenType = string | symbol;

export function isInjectionToken<T = unknown>(provider: unknown): provider is InjectionToken<T> {
    return typeof provider === "string" || typeof provider === "symbol" || (typeof provider === "function" && provider.prototype);
}
