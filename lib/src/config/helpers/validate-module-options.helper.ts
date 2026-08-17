import type { Strategies } from "../../shared/model";
import type { RateLimiterModuleFullOptions } from "../options";

export function validateModuleOptions(options: RateLimiterModuleFullOptions): asserts options is RateLimiterModuleFullOptions {}

function validateScope(options: RateLimiterModuleFullOptions) {
    if (!options.scope) {
        return [`Default scope not provided. Received: ${options.scope}`];
    }

    if (typeof options.scope !== "string") {
        return [`Invalid scope type provided. Expected string, but receive ${typeof options.scope}`];
    }

    return [];
}

function validateStrategy(options: RateLimiterModuleFullOptions) {
    const availableStrategies: Strategies[] = ["fixed-window", "token-bucket", "sliding-window-counter", "sliding-window-log", "leaky-bucket"];

    if (!availableStrategies.includes(options.strategy)) {
        return [`Unknown default strategy: ${options.strategy}`];
    }

    return [];
}
