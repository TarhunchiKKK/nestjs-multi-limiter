import type { InjectionToken } from "@nestjs/common";
import type { AllStrategiesOptions } from "../../executors";
import type { ExtractMember } from "../../shared/lib";
import type { IRedisAdapter, StorageTypes, Strategies } from "../../shared/model";

export type InMemoryStorageOptions = {
    /**
     * Type of storage.
     */
    type: ExtractMember<StorageTypes, "in-memory">;

    /**
     * Time for collecting dead data.
     */
    gcTime?: number;
};

export type RedisStorageOptions<Mode extends "sync" | "async"> = {
    /**
     * Type of storage.
     */
    type: ExtractMember<StorageTypes, "redis">;

    /**
     * Custom adapter for Redis access.
     */
    adapter: Mode extends "async" ? InjectionToken<IRedisAdapter> | IRedisAdapter : IRedisAdapter;
};

/**
 * Options for rate limiting data storage.
 */
export type StorageOptions<Mode extends "sync" | "async"> = InMemoryStorageOptions | RedisStorageOptions<Mode>;

export type StrategyOptions = {
    strategy: Strategies;
    strategyOptions: AllStrategiesOptions;
};
