import type { AllStrategiesOptions } from "../../executors";
import type { ExtractMember } from "../../shared/lib";
import type { RedisStorage, StorageTypes, Strategies } from "../../shared/model";

export type StorageOptions =
    | { type: ExtractMember<StorageTypes, "in-memory">; gcTime?: number }
    | { type: ExtractMember<StorageTypes, "redis">; instance: RedisStorage };

export type StrategyOptions = {
    strategy: Strategies;
    strategyOptions: AllStrategiesOptions;
};
