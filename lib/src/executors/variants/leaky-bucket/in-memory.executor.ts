import { InjectStorage } from "../../../di";
import type { InMemoryStorage, Key } from "../../../shared/model";
import { Executor, type IExecutor } from "../../lib";
import type { LeakyBucketOptions, LeakyBucketState } from "./types";

@Executor({ strategy: "leaky-bucket", storage: "in-memory" })
export class LeakyBucketInMemoryExecutor implements IExecutor<LeakyBucketOptions> {
    public constructor(@InjectStorage() private readonly storage: InMemoryStorage<LeakyBucketState>) {}

    public check(key: Key, options: LeakyBucketOptions) {
        const now = Date.now();

        const state = this.storage.get(key);

        if (!state) {
            return this.handleNotExistingState(key, now, options);
        }

        const currentWater = this.getCurrentWater(state, options, now);

        if (currentWater + 1 <= options.capacity) {
            return this.handleNotFullBucket(key, currentWater, now, options);
        }

        return this.handleFullBucket(key, currentWater, options, state);
    }

    private handleNotExistingState(key: Key, now: number, options: LeakyBucketOptions) {
        const nextWater = 1;

        this.storage.set(key, {
            water: nextWater,
            lastLeaked: now,
            expiresAt: this.getExpiration(nextWater, options, now)
        });

        return true;
    }

    private getCurrentWater(state: LeakyBucketState, options: LeakyBucketOptions, now: number) {
        const elapsed = now - state.lastLeaked;

        const leakedWater = elapsed * options.leakRate;

        return Math.max(0, state.water - leakedWater);
    }

    private handleNotFullBucket(key: string, currentWater: number, now: number, options: LeakyBucketOptions) {
        const nextWater = currentWater + 1;

        this.storage.set(key, {
            water: nextWater,
            lastLeaked: now,
            expiresAt: this.getExpiration(nextWater, options, now)
        });

        return true;
    }

    private handleFullBucket(key: string, currentWater: number, options: LeakyBucketOptions, oldState: LeakyBucketState) {
        const timeToEmptyLeak = currentWater / options.leakRate;
        const expiresAt = oldState.lastLeaked + timeToEmptyLeak;

        this.storage.set(key, {
            water: currentWater,
            lastLeaked: oldState.lastLeaked,
            expiresAt: expiresAt
        });

        return false;
    }

    private getExpiration(currentWater: number, options: LeakyBucketOptions, baseTime: number) {
        const timeToEmptyLeak = currentWater / options.leakRate;

        return baseTime + timeToEmptyLeak;
    }
}
