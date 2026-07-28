import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { Test } from "@nestjs/testing";
import { STORAGE_TOKEN } from "../../../../src/di";
import { LeakyBucketInMemoryExecutor, type LeakyBucketOptions, type LeakyBucketState } from "../../../../src/executors";
import type { InMemoryStorage } from "../../../../src/shared/model";
import { createInMemoryStorage, MS_IN_SECOND } from "../../../shared";

describe("LeakyBucketInMemoryExecutor", () => {
    let executor: LeakyBucketInMemoryExecutor;
    let storage: InMemoryStorage<LeakyBucketState>;
    const key = "rate-limiter:leaky-bucket:key:scope";

    beforeEach(async () => {
        storage = createInMemoryStorage<LeakyBucketState>();

        const module = await Test.createTestingModule({
            providers: [
                LeakyBucketInMemoryExecutor,
                {
                    provide: STORAGE_TOKEN,
                    useValue: storage
                }
            ]
        }).compile();

        executor = module.get(LeakyBucketInMemoryExecutor);

        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should fill the bucket up to capacity and then deny further requests", () => {
        const options: LeakyBucketOptions = {
            capacity: 3,
            leakRate: 1 / (10 * MS_IN_SECOND),
            ttl: 5 * MS_IN_SECOND
        };

        for (let i = 0; i < options.capacity; i++) {
            const check = executor.check(key, options);

            expect(check).toBeTrue();
        }

        const blockedCheck = executor.check(key, options);
        expect(blockedCheck).toBeFalse();
    });

    it("should leak water over time and allow new requests", () => {
        const options: LeakyBucketOptions = {
            capacity: 2,
            leakRate: 1 / 100,
            ttl: 5 * MS_IN_SECOND
        };

        for (let i = 0; i < options.capacity; i++) {
            const check = executor.check(key, options);

            expect(check).toBeTrue();
        }

        const blockedCheck = executor.check(key, options);
        expect(blockedCheck).toBeFalse();

        jest.advanceTimersByTime(110);

        const successfulCheck = executor.check(key, options);
        expect(successfulCheck).toBeTrue();

        const emptyBucketCheck = executor.check(key, options);
        expect(emptyBucketCheck).toBeFalse();
    });

    it("should prevent water level from dropping below zero", () => {
        const options: LeakyBucketOptions = {
            capacity: 2,
            leakRate: 1,
            ttl: 5 * MS_IN_SECOND
        };

        const initialCheck = executor.check(key, options);
        expect(initialCheck).toBeTrue();

        jest.advanceTimersByTime(20);

        for (let i = 0; i < options.capacity; i++) {
            const check = executor.check(key, options);

            expect(check).toBeTrue();
        }

        const blockedCheck = executor.check(key, options);
        expect(blockedCheck).toBeFalse();
    });

    it("should correctly update and persist internal storage state properties", () => {
        const options: LeakyBucketOptions = {
            capacity: 5,
            leakRate: 0.01,
            ttl: 5 * MS_IN_SECOND
        };

        const initialCheck = executor.check(key, options);
        expect(initialCheck).toBeTrue();

        const state = storage.get(key);
        expect(state).toBeDefined();
        expect(state?.water).toBe(1);
        expect(state?.lastLeaked).toBeLessThanOrEqual(Date.now());
    });
});
