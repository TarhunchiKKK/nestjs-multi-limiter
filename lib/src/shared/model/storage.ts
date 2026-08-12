import type Redis from "ioredis";
import type { RedisValue } from "ioredis";
import type { Key } from "./keys";

/**
 * Types of storages.
 *
 * @publicApi
 */
export type StorageTypes = "in-memory" | "redis";

export type InMemoryStorage<Value> = Map<Key, Value>;

/**
 * Interface for custom Redis adapters.
 *
 * @publicApi
 */
export type IRedisAdapter = {
    // FIX: Replace `RedisValue` with custom type
    eval(...args: [script: string | Buffer, numkeys: number | string, ...args: RedisValue[]]): ReturnType<Redis["eval"]>;
};

export type Storage = InMemoryStorage<unknown> | IRedisAdapter;
