import type { RedisFailingStrategies } from "../model";

export class UnknownRedisFailingStrategyError extends Error {
    public constructor(failingStrategy: unknown) {
        super(
            `Unknown Redis failing strategy. Expected ${"fail-open" satisfies RedisFailingStrategies}, ${"fail-close" satisfies RedisFailingStrategies} or ${"fail-fast" satisfies RedisFailingStrategies}, but receive ${failingStrategy}`
        );
    }
}
