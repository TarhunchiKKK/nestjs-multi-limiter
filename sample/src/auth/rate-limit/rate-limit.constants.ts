import type { RateLimitOptions } from "nestjs-multi-limiter";
import { IpKeyExtractor } from "../../shared/ip.key-extractor";
import { MS_IN_MINUTE } from "../../shared/time.constants";
import { BruteForceKeyExtractor } from "./brute-force.key-extractor";
import { TrySignUpLaterOptionsFactory } from "./try-sign-up-later.error-factory";

export const SIGN_UP_RATE_LIMIT_OPTIONS: RateLimitOptions = {
    scope: "sign-up",
    strategy: "fixed-window",
    options: {
        limit: 3,
        ttl: 1 * MS_IN_MINUTE
    },
    keyExtractor: IpKeyExtractor,
    errorFactory: TrySignUpLaterOptionsFactory
};

export const SIGN_IN_RATE_LIMIT_OPTIONS: RateLimitOptions = {
    scope: "sign-in",
    strategy: "fixed-window",
    options: {
        limit: 5,
        ttl: 1 * MS_IN_MINUTE
    },
    keyExtractor: BruteForceKeyExtractor
};
