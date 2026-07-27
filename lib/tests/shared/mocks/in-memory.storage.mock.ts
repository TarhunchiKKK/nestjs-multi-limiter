import { mock } from "bun:test";
import type { Key } from "../../../src/shared/model/keys";

export function createInMemoryStorageMock<Value>() {
    return {
        get: mock<Map<Key, Value>["get"]>(() => ({}) as Value),
        set: mock<Map<Key, Value>["set"]>(() => ({}) as Map<Key, Value>)
    } satisfies Partial<Record<keyof Map<Key, Value>, unknown>>;
}
