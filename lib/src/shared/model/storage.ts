import { IncorrectLuaScriptResultError } from "../errors";
import type { Key } from "./keys";

/**
 * Types of storages.
 *
 * @publicApi
 */
export type StorageTypes = "in-memory" | "redis";

export type InMemoryStorage<Value> = Map<Key, Value>;

export type RedisFailingStrategies = "fail-open" | "fail-close" | "fail-fast";

/**
 * Interface for custom Redis adapters.
 *
 * @publicApi
 */
export type IRedisAdapter = {
    eval(script: string | Buffer, numKeys: number, ...args: (number | string | Buffer)[]): Promise<unknown>;

    onError?(error: unknown): void | Promise<void>;
};

export type Storage = InMemoryStorage<unknown> | IRedisAdapter;

export function castLuaScriptResult(value: unknown) {
    switch (value) {
        case 1:
            return true;
        case 0:
            return false;
        default:
            throw new IncorrectLuaScriptResultError(value);
    }
}
