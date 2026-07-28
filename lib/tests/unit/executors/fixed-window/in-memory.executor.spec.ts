import { beforeEach, describe, expect, it } from "bun:test";
import { Test } from "@nestjs/testing";
import { STORAGE_TOKEN } from "../../../../src/di";
import { FixedWindowInMemoryExecutor, type FixedWindowOptions, type FixedWindowState } from "../../../../src/executors";
import type { InMemoryStorage } from "../../../../src/shared/model";
import { createInMemoryStorage, MS_IN_SECOND } from "../../../shared";

describe("FixedWindowInMemoryExecutor", () => {
    let executor: FixedWindowInMemoryExecutor;
    let storage: InMemoryStorage<FixedWindowState>;
    const key = "rate-limiter:fixed-window:key:scope";

    beforeEach(async () => {
        storage = createInMemoryStorage<FixedWindowState>();

        const module = await Test.createTestingModule({
            providers: [
                FixedWindowInMemoryExecutor,
                {
                    provide: STORAGE_TOKEN,
                    useValue: storage
                }
            ]
        }).compile();

        executor = module.get(FixedWindowInMemoryExecutor);
    });

    it("should allow request up to the limit and then deny", () => {
        const options: FixedWindowOptions = {
            limit: 2,
            ttl: 5 * MS_IN_SECOND
        };

        for (let i = 0; i < options.limit; i++) {
            const check = executor.check(key, options);

            expect(check).toBeTrue();
        }

        const blockedCheck = executor.check(key, options);
        expect(blockedCheck).toBeFalse();
    });

    it("should reset the limit after TTL expires", () => {
        const options: FixedWindowOptions = {
            limit: 1,
            ttl: 100
        };

        const successfulCheck = executor.check(key, options);
        expect(successfulCheck).toBeTrue();

        const blockedCheck = executor.check(key, options);
        expect(blockedCheck).toBeFalse();

        Bun.sleep(options.ttl + 20);

        const newCheck = executor.check(key, options);
        expect(newCheck).toBeTrue();
    });

    it("should isolate limits for different keys", () => {
        const options: FixedWindowOptions = {
            limit: 1,
            ttl: MS_IN_SECOND
        };
        const alternativeKey = "rate-limiter:fixed-window:alternative-key:scope";

        const successfulCheck = executor.check(key, options);
        expect(successfulCheck).toBeTrue();

        const blockedCheck = executor.check(key, options);
        expect(blockedCheck).toBeFalse();

        const alternativeKeyCheck = executor.check(alternativeKey, options);
        expect(alternativeKeyCheck).toBeTrue();
    });

    it("should update the internal storage state correctly", () => {
        const options: FixedWindowOptions = {
            limit: 5,
            ttl: 2 * MS_IN_SECOND
        };

        // update storage state
        executor.check(key, options);

        const state = storage.get(key);

        expect(state).toBeDefined();
        expect(state?.count).toBe(1);
        expect(state?.resetTime).toBeGreaterThan(Date.now());
    });
});
