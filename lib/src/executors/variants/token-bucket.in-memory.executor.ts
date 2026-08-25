import { InjectStorage } from "../../di";
import type { InMemoryStorage, Key, TokenBucketOptions } from "../../shared/model";
import { type BaseStrategyInMemoryState, Executor, type IExecutor } from "../lib";

export type TokenBucketState = BaseStrategyInMemoryState & {
    /**
     * Current tokens count.
     */
    tokens: number;

    /**
     * Timestamp of last tokens refilling.
     */
    lastRefilled: number;
};

@Executor({ strategy: "token-bucket", storage: "in-memory" })
export class TokenBucketInMemoryExecutor implements IExecutor<TokenBucketOptions> {
    public constructor(@InjectStorage() private readonly storage: InMemoryStorage<TokenBucketState>) {}

    public check(key: Key, options: TokenBucketOptions) {
        const state = this.storage.get(key);
        const now = Date.now();

        if (!state) {
            this.setInitialState(key, options, now);
            return true;
        }

        const { currentTokens, refilledAt } = this.refillTokens(state, options, now);

        if (currentTokens >= 1) {
            const nextTokens = currentTokens - 1;

            this.storage.set(key, {
                tokens: nextTokens,
                lastRefilled: refilledAt,
                expiresAt: this.getExpiration(nextTokens, options, refilledAt)
            });

            return true;
        }

        this.storage.set(key, {
            tokens: currentTokens,
            lastRefilled: refilledAt,
            expiresAt: this.getExpiration(currentTokens, options, refilledAt)
        });

        return false;
    }

    private setInitialState(key: Key, options: TokenBucketOptions, now: number) {
        const nextTokens = options.capacity - 1;

        const initialState: TokenBucketState = {
            tokens: options.capacity - 1,
            lastRefilled: now,
            expiresAt: this.getExpiration(nextTokens, options, now)
        };

        this.storage.set(key, initialState);
    }

    private refillTokens(state: TokenBucketState, options: TokenBucketOptions, now: number) {
        const elapsed = Math.max(0, now - state.lastRefilled);

        const refilledTokens = elapsed * options.refillRate;

        const currentTokens = Math.min(options.capacity, state.tokens + refilledTokens);

        return {
            currentTokens: currentTokens,
            refilledAt: now
        };
    }

    private getExpiration(currentTokens: number, options: TokenBucketOptions, baseTime: number) {
        const missingTokens = options.capacity - currentTokens;

        const timeToFullRefill = missingTokens / options.refillRate;

        return baseTime + timeToFullRefill;
    }
}
