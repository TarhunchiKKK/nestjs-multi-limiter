import { InjectStorage } from "../../../di";
import type { InMemoryStorage, Key } from "../../../shared/model";
import { Executor, type IExecutor } from "../../lib";
import type { SlidingWindowLogOptions, SlidingWindowLogState } from "./types";

@Executor({ strategy: "sliding-window-log", storage: "in-memory" })
export class SlidingWindowLogInMemoryExecutor implements IExecutor<SlidingWindowLogOptions> {
    public constructor(@InjectStorage() private readonly storage: InMemoryStorage<SlidingWindowLogState>) {}

    public check(key: Key, options: SlidingWindowLogOptions) {
        const now = Date.now();
        const timestamps = this.getRelevantTimestamps(key, options, now);

        if (timestamps.length < options.limit) {
            timestamps.push(now);

            this.storage.set(key, {
                timestamps: timestamps,
                expiresAt: this.getExpiration(options, now)
            });

            return true;
        }

        const lastSuccessfulTimestamp = timestamps[timestamps.length - 1];

        this.storage.set(key, {
            timestamps: timestamps,
            expiresAt: this.getExpiration(options, lastSuccessfulTimestamp)
        });

        return false;
    }

    private getRelevantTimestamps(key: Key, options: SlidingWindowLogOptions, baseTime: number) {
        const clearBefore = baseTime - options.windowMs;

        const state = this.storage.get(key);

        return (state?.timestamps ?? []).filter((timestamp) => timestamp > clearBefore);
    }

    private getExpiration(options: SlidingWindowLogOptions, baseTime: number) {
        return baseTime + options.windowMs;
    }
}
