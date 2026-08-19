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
    eval(script: string | Buffer, numKeys: number, ...args: unknown[]): Promise<unknown>;
};

export type Storage = InMemoryStorage<unknown> | IRedisAdapter;
