import type Redis from "ioredis";
import type { RedisValue } from "ioredis";
import type { Key } from "./keys";

export type StorageTypes = "in-memory" | "redis";

export type InMemoryStorage<Value> = Map<Key, Value>;

export type RedisAdapter = {
    eval(...args: [script: string | Buffer, numkeys: number | string, ...args: RedisValue[]]): ReturnType<Redis["eval"]>;
};

export type Storage = InMemoryStorage<unknown> | RedisAdapter;
