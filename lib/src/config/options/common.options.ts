import type { AllStrategiesOptions } from "../../executors";
import type { ExtractMember } from "../../shared/lib";
import type { RedisAdapter, StorageTypes, Strategies } from "../../shared/model";

export type StorageOptions =
    | { type: ExtractMember<StorageTypes, "in-memory">; gcTime?: number }
    | { type: ExtractMember<StorageTypes, "redis">; adapter: RedisAdapter };

export type StrategyOptions = {
    strategy: Strategies;
    strategyOptions: AllStrategiesOptions;
};
