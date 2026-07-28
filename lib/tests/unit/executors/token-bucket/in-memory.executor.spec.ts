import { beforeEach, describe, expect, it } from "bun:test";
import { Test } from "@nestjs/testing";
import { STORAGE_TOKEN } from "../../../../src/di";
import { TokenBucketInMemoryExecutor, type TokenBucketOptions, type TokenBucketState } from "../../../../src/executors";
import type { InMemoryStorage } from "../../../../src/shared/model";
import { createInMemoryStorage, MS_IN_SECOND } from "../../../shared";

describe("TokenBucketInMemoryExecutor", () => {
    let executor: TokenBucketInMemoryExecutor;
    let storage: InMemoryStorage<TokenBucketState>;
    const key = "rate-limiter:token-bucket:key:scope";

    beforeEach(async () => {
        storage = createInMemoryStorage<TokenBucketState>();

        const module = await Test.createTestingModule({
            providers: [
                TokenBucketInMemoryExecutor,
                {
                    provide: STORAGE_TOKEN,
                    useValue: storage
                }
            ]
        }).compile();

        executor = module.get(TokenBucketInMemoryExecutor);
    });

    it("should consume tokens down to zero and then block requests", () => {
        const options: TokenBucketOptions = {
            capacity: 3,
            refillRate: 1 / (10 * MS_IN_SECOND),
            ttl: 5 * MS_IN_SECOND
        };

        for (let i = 0; i < options.capacity; i++) {
            const check = executor.check(key, options);

            expect(check).toBeTrue();
        }

        const blockedCheck = executor.check(key, options);
        expect(blockedCheck).toBeFalse();
    });

    it("should refill tokens incrementally based on elapsed time", async () => {
        const options: TokenBucketOptions = {
            capacity: 2,
            refillRate: 1 / 100,
            ttl: 5 * MS_IN_SECOND
        };

        for (let i = 0; i < options.capacity; i++) {
            const check = executor.check(key, options);

            expect(check).toBeTrue();
        }

        const blockedCheck = executor.check(key, options);
        expect(blockedCheck).toBeFalse();

        await Bun.sleep(110);

        const oneTokenCheck = executor.check(key, options);
        expect(oneTokenCheck).toBeTrue();

        const noTokensCheck = executor.check(key, options);
        expect(noTokensCheck).toBeFalse();
    });

    it("should capped tokens at maximum capacity even after long sleep", async () => {
        const options: TokenBucketOptions = {
            capacity: 2,
            refillRate: 1,
            ttl: 5 * MS_IN_SECOND
        };

        const initialCheck = executor.check(key, options);
        expect(initialCheck).toBeTrue();

        await Bun.sleep(options.refillRate * 20);

        for (let i = 0; i < options.capacity; i++) {
            const check = executor.check(key, options);

            expect(check).toBeTrue();
        }

        const noTokensCheck = executor.check(key, options);
        expect(noTokensCheck).toBeFalse();
    });

    it("should correctly update and store state variables", () => {
        const options: TokenBucketOptions = {
            capacity: 5,
            refillRate: 1 / 10,
            ttl: 5 * MS_IN_SECOND
        };

        const initialCheck = executor.check(key, options);
        expect(initialCheck).toBeTrue();

        const state = storage.get(key);
        expect(state).toBeDefined();
        expect(state?.tokens).toBe(options.capacity - 1);
        expect(state?.lastRefilled).toBeLessThanOrEqual(Date.now());
    });
});
