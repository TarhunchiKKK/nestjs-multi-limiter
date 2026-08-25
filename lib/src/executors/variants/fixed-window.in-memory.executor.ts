import { InjectStorage } from "../../di";
import type { FixedWindowOptions, InMemoryStorage, Key } from "../../shared/model";
import { type BaseStrategyInMemoryState, Executor, type IExecutor } from "../lib";

export type FixedWindowState = BaseStrategyInMemoryState & {
    /**
     * Current allowed requests count.
     */
    count: number;

    /**
     * Last reset timestamp.
     */
    resetTime: number;
};

@Executor({ strategy: "fixed-window", storage: "in-memory" })
export class FixedWindowInMemoryExecutor implements IExecutor<FixedWindowOptions> {
    public constructor(@InjectStorage() private readonly storage: InMemoryStorage<FixedWindowState>) {}

    public check(key: Key, options: FixedWindowOptions) {
        let state = this.storage.get(key);
        const now = Date.now();

        if (!state || state.resetTime < now) {
            const resetTime = now + options.ttl;

            state = {
                count: 0,
                resetTime: resetTime,
                expiresAt: resetTime
            };
        }

        if (state.count < options.limit) {
            state.count += 1;
            this.storage.set(key, state);
            return true;
        }

        this.storage.set(key, state);

        return false;
    }
}
