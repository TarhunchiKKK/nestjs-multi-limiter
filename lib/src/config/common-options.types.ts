import type { StrategyOptionsMap } from "../executors";
import type { ExtractMember } from "../shared/lib";
import type { IRedisAdapter, RedisFailingStrategies, StorageTypes, Strategies } from "../shared/model";

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
          adapter: IRedisAdapter;

          /**
           * Redis failing strategy.
           */
          failingStrategy?: RedisFailingStrategies;
      };

export type StrategyOptions = {
    strategy: Strategies;

    strategyOptions: StrategyOptionsMap;
};
