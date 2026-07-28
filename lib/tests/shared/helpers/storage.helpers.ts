import type { Key } from "../../../src";

export function createInMemoryStorage<State>() {
    return new Map<Key, State>();
}
