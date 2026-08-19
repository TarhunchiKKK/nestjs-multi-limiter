import type { RateLimitOptions } from "nestjs-multi-limiter";
import { MS_IN_MINUTE } from "../../shared/time.constants";

export const CHATS_CONTROLLER_RATE_LIMIT_OPTIONS: RateLimitOptions = {
    scope: "chats-write",
    strategy: "sliding-window-counter",
    windowMs: 1 * MS_IN_MINUTE
};
