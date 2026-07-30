import type { StrategyOptions } from "./common.options";
import type { RateLimitOptions } from "./decorator.options";

export type RateLimitGuardOptions = Required<Pick<RateLimitOptions, "scope" | "keyExtractor" | "errorFactory">> &
    Pick<RateLimitOptions, "factory"> &
    StrategyOptions;
