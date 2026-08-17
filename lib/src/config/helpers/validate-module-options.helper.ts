import type { Strategies } from "../../shared/model";
import type { RateLimiterModuleFullOptions } from "../options";

export class RateLimiterModuleConfigurationError extends Error {
    public constructor(errors: string[]) {
        const message = `\n[RateLimiterModule] Configuration Validation Failed:\n${errors.map((err) => `  - ${err}`).join("\n")}`;

        super(message);
    }
}

export function validateModuleOptions(options: RateLimiterModuleFullOptions): asserts options is RateLimiterModuleFullOptions {
    const errors: string[] = [];
    const validators = [validateScope, validateStorage, validateStrategy, validateStrategyOptions];

    for (const validator of validators) {
        const validatorErrors = validator(options);

        errors.concat(validatorErrors);
    }

    if (errors.length !== 0) {
        throw new RateLimiterModuleConfigurationError(errors);
    }
}

function validateScope(options: RateLimiterModuleFullOptions): string[] {
    if (!options.scope) {
        return [`Default scope not provided. Received: ${options.scope}`];
    }

    if (typeof options.scope !== "string") {
        return [`Invalid scope type provided. Expected string, but receive ${typeof options.scope}`];
    }

    return [];
}

function validateStorage(options: RateLimiterModuleFullOptions): string[] {
    switch (options.storage.type) {
        case "in-memory": {
            if (typeof options.storage.gcTime !== "number" || options.storage.gcTime < 0) {
                return [`Invalid garbage collection type. Expected positive number, but receive ${options.storage.gcTime}`];
            }

            return [];
        }
        case "redis": {
            if (!options.storage.adapter) {
                return [`Redis adapter is not provided.`];
            }

            return [];
        }
        default: {
            return [`Unknown storage type. Receive ${options.storage}`];
        }
    }
}

function validateStrategy(options: RateLimiterModuleFullOptions): string[] {
    const availableStrategies: Strategies[] = ["fixed-window", "token-bucket", "sliding-window-counter", "sliding-window-log", "leaky-bucket"];

    if (!availableStrategies.includes(options.strategy)) {
        return [`Unknown default strategy: ${options.strategy}`];
    }

    return [];
}

function validateStrategyOptions(options: RateLimiterModuleFullOptions): string[] {
    const errors: string[] = [];
    const strategyOptions = options.strategyOptions;

    if (typeof strategyOptions.fixedWindow.limit !== "number" || strategyOptions.fixedWindow.limit < 0) {
        errors.push(`Invalid limit for "fixed-window" strategy. Expected positive number, but receive ${strategyOptions.fixedWindow.limit}`);
    }

    if (typeof strategyOptions.fixedWindow.ttl !== "number" || strategyOptions.fixedWindow.ttl < 0) {
        errors.push(`Invalid ttl for "fixed-window" strategy. Expected positive number, but receive ${strategyOptions.fixedWindow.ttl}`);
    }

    if (typeof strategyOptions.tokenBucket.capacity !== "number" || strategyOptions.tokenBucket.capacity < 0) {
        errors.push(`Invalid capacity for "token-bucket" strategy. Expected positive number, but receive ${strategyOptions.tokenBucket.capacity}`);
    }

    if (typeof strategyOptions.tokenBucket.refillRate !== "number" || strategyOptions.tokenBucket.refillRate < 0) {
        errors.push(`Invalid refill rate for "token-bucket" strategy. Expected positive number, but receive ${strategyOptions.tokenBucket.refillRate}`);
    }

    if (typeof strategyOptions.tokenBucket.ttl !== "number" || strategyOptions.tokenBucket.ttl < 0) {
        errors.push(`Invalid ttl for "token-bucket" strategy. Expected positive number, but receive ${strategyOptions.tokenBucket.ttl}`);
    }

    if (typeof strategyOptions.slidingWindowCounter.limit !== "number" || strategyOptions.slidingWindowCounter.limit < 0) {
        errors.push(`Invalid limit for "sliding-window-counter" strategy. Expected positive number, but receive ${strategyOptions.slidingWindowCounter.limit}`);
    }

    if (typeof strategyOptions.slidingWindowCounter.windowMs !== "number" || strategyOptions.slidingWindowCounter.windowMs < 0) {
        errors.push(
            `Invalid window length for "sliding-window-counter" strategy. Expected positive number, but receive ${strategyOptions.slidingWindowCounter.windowMs}`
        );
    }

    if (typeof strategyOptions.slidingWindowLog.limit !== "number" || strategyOptions.slidingWindowLog.limit < 0) {
        errors.push(`Invalid limit for "sliding-window-log" strategy. Expected positive number, but receive ${strategyOptions.slidingWindowLog.limit}`);
    }

    if (typeof strategyOptions.slidingWindowLog.windowMs !== "number" || strategyOptions.slidingWindowLog.windowMs < 0) {
        errors.push(
            `Invalid window length for "sliding-window-log" strategy. Expected positive number, but receive ${strategyOptions.slidingWindowLog.windowMs}`
        );
    }

    if (typeof strategyOptions.leakyBucket.capacity !== "number" || strategyOptions.leakyBucket.capacity < 0) {
        errors.push(`Invalid capacity for "leaky-bucket" strategy. Expected positive number, but receive ${strategyOptions.leakyBucket.capacity}`);
    }

    if (typeof strategyOptions.leakyBucket.leakRate !== "number" || strategyOptions.leakyBucket.leakRate < 0) {
        errors.push(`Invalid leak rate for "leaky-bucket" strategy. Expected positive number, but receive ${strategyOptions.leakyBucket.leakRate}`);
    }

    if (typeof strategyOptions.leakyBucket.ttl !== "number" || strategyOptions.leakyBucket.ttl < 0) {
        errors.push(`Invalid ttl for "leaky-bucket" strategy. Expected positive number, but receive ${strategyOptions.leakyBucket.ttl}`);
    }

    return errors;
}
