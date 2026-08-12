import type { RateLimitOptions } from "nestjs-multi-limiter";
import { MS_IN_MINUTE } from "../../shared/time.constants";

export const CHATS_WRITE_RATE_LIMIT_OPTIONS: RateLimitOptions = {
    scope: "chats-write",
    strategy: "sliding-window-counter",
    limit: 20,
    windowMs: 1 * MS_IN_MINUTE
};

export const CHATS_READ_RATE_LIMIT_OPTIONS: RateLimitOptions = {
    scope: "chats-read",
    strategy: "sliding-window-counter",
    limit: 60,
    windowMs: 1 * MS_IN_MINUTE
};
