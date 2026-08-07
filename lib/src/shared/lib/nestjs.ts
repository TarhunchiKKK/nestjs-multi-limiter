import type { Provider } from "@nestjs/common";

export type TokenType = string | symbol;

export function isProvider(provider: unknown): provider is Provider {
    return typeof provider === "function" && provider.prototype;
}
