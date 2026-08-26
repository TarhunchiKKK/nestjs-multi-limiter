import type { RateLimitOptions } from "nestjs-multi-limiter";
import { MS_IN_MINUTE } from "../../shared/time.constants";

export const MESSAGES_READ_RATE_LIMIT_OPTIONS: RateLimitOptions = {
    scope: "messages-read",
    strategy: "sliding-window-counter",
    options: {
        limit: 60,
        windowMs: 1 * MS_IN_MINUTE
    }
};
