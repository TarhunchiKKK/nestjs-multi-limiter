import type { StorageTypes } from "../model";

export class UnknownRateLimitStorageError extends Error {
    public constructor(storageType: unknown) {
        super(`Unknown storage type. Expected ${"in-memory" satisfies StorageTypes} or ${"redis" satisfies StorageTypes}, but receive ${storageType}`);
    }
}
