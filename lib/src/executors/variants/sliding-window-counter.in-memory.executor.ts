import { InjectStorage } from "../../di";
import type { InMemoryStorage, Key, SlidingWindowCounterOptions } from "../../shared/model";
import { type BaseStrategyInMemoryState, Executor, type IExecutor } from "../lib";

export type SlidingWindowCounterState = BaseStrategyInMemoryState & {
    /**
     * Current window start timestamp.
     */
    currentWindowStart: number;

    /**
     * Current window requests counter.
     */
    currentCount: number;

    /**
     * Previous window requests counter.
     */
    previousCount: number;
};

@Executor({ strategy: "sliding-window-counter", storage: "in-memory" })
export class SlidingWindowCounterInMemoryExecutor implements IExecutor<SlidingWindowCounterOptions> {
    public constructor(@InjectStorage() private readonly storage: InMemoryStorage<SlidingWindowCounterState>) {}

    public check(key: Key, options: SlidingWindowCounterOptions) {
        const now = Date.now();

        const currentWindowStart = Math.floor(now / options.windowMs) * options.windowMs;

        let state = this.getState(key, currentWindowStart, options);

        state = this.checkPassedWindows(state, options, currentWindowStart);

        const calculatedWeightCount = this.calculateWeightCount(state, options, currentWindowStart, now);

        if (calculatedWeightCount < options.limit) {
            state.currentCount += 1;
            this.storage.set(key, state);
            return true;
        }

        this.storage.set(key, state);

        return false;
    }

    private getState(key: Key, currentWindowStart: number, options: SlidingWindowCounterOptions) {
        let state = this.storage.get(key);

        if (!state) {
            state = {
                currentWindowStart: currentWindowStart,
                currentCount: 0,
                previousCount: 0,
                expiresAt: this.getExpiration(currentWindowStart, options)
            };
        }

        return { ...state };
    }

    private checkPassedWindows(state: SlidingWindowCounterState, options: SlidingWindowCounterOptions, currentWindowStart: number) {
        const timePassedSinceStoredWindow = currentWindowStart - state.currentWindowStart;

        if (timePassedSinceStoredWindow === options.windowMs) {
            return {
                currentWindowStart: currentWindowStart,
                currentCount: 0,
                previousCount: state.currentCount,
                expiresAt: this.getExpiration(currentWindowStart, options)
            };
        } else if (timePassedSinceStoredWindow > options.windowMs) {
            return {
                currentWindowStart: currentWindowStart,
                currentCount: 0,
                previousCount: 0,
                expiresAt: this.getExpiration(currentWindowStart, options)
            };
        }

        return state;
    }

    private calculateWeightCount(state: SlidingWindowCounterState, options: SlidingWindowCounterOptions, currentWindowStart: number, now: number) {
        const timeElapsedInCurrentWindow = now - currentWindowStart;

        const previousWindowWeight = 1 - timeElapsedInCurrentWindow / options.windowMs;

        const calculatedWeightCount = state.currentCount + state.previousCount * previousWindowWeight;

        return calculatedWeightCount;
    }

    private getExpiration(currentWindowStart: number, options: SlidingWindowCounterOptions) {
        return currentWindowStart + options.windowMs * 2;
    }
}
