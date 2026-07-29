import type { AllStrategiesOptions } from "../../executors";
import type { ExtractMember } from "../../shared/lib";
import type { RedisAdapter, StorageTypes, Strategies } from "../../shared/model";

/**
 * Options for rate limiting data storage.
 */
export type StorageOptions =
    | {
          /**
           * Type of storage.
           */
          type: ExtractMember<StorageTypes, "in-memory">;

          /**
           * Time for collecting dead data.
           */
          gcTime?: number;
      }
    | {
          /**
           * Type of storage.
           */
          type: ExtractMember<StorageTypes, "redis">;

          /**
           * Custom adapter for Redis access.
           */
          adapter: RedisAdapter;
      };

export type StrategyOptions = {
    strategy: Strategies;
    strategyOptions: AllStrategiesOptions;
};
