import { InjectStorage } from "../../../di";
import type { InMemoryStorage, Key } from "../../../shared/model";
import { Executor, type IExecutor } from "../../lib";
import type { TokenBucketOptions, TokenBucketState } from "./types";

@Executor({ strategy: "token-bucket", storage: "in-memory" })
export class TokenBucketInMemoryExecutor implements IExecutor<TokenBucketOptions> {
    public constructor(@InjectStorage() private readonly storage: InMemoryStorage<TokenBucketState>) {}

    public check(key: Key, options: TokenBucketOptions) {
        const state = this.storage.get(key);

        if (!state) {
            this.setInitialState(key, options);
            return true;
        }

        const { currentTokens, refilledAt } = this.refillTokens(state, options);

        if (currentTokens >= 1) {
            this.storage.set(key, {
                tokens: currentTokens - 1,
                lastRefilled: refilledAt
            });
            return true;
        }

        this.storage.set(key, {
            tokens: currentTokens,
            lastRefilled: refilledAt
        });

        return false;
    }

    private setInitialState(key: Key, options: TokenBucketOptions) {
        const initialState: TokenBucketState = {
            tokens: options.capacity - 1,
            lastRefilled: Date.now()
        };

        this.storage.set(key, initialState);
    }

    private refillTokens(state: TokenBucketState, options: TokenBucketOptions) {
        const now = Date.now();

        const elapsed = Math.max(0, now - state.lastRefilled);

        const refilledTokens = elapsed * options.refillRate;

        const currentTokens = Math.min(options.capacity, state.tokens + refilledTokens);

        return {
            currentTokens: currentTokens,
            refilledAt: now
        };
    }
}
