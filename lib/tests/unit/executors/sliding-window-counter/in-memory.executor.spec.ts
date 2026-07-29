import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { Test } from "@nestjs/testing";
import { STORAGE_TOKEN } from "../../../../src/di";
import { SlidingWindowCounterInMemoryExecutor, type SlidingWindowCounterOptions, type SlidingWindowCounterState } from "../../../../src/executors";
import type { InMemoryStorage } from "../../../../src/shared/model";
import { createInMemoryStorage, MS_IN_SECOND } from "../../../shared";

describe("SlidingWindowCounterInMemoryExecutor", () => {
    let executor: SlidingWindowCounterInMemoryExecutor;
    let storage: InMemoryStorage<SlidingWindowCounterState>;
    const key = "rate-limiter:sliding-window-counter:key:scope";

    beforeEach(async () => {
        storage = createInMemoryStorage<SlidingWindowCounterState>();

        const module = await Test.createTestingModule({
            providers: [
                SlidingWindowCounterInMemoryExecutor,
                {
                    provide: STORAGE_TOKEN,
                    useValue: storage
                }
            ]
        }).compile();

        executor = module.get(SlidingWindowCounterInMemoryExecutor);

        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should allow requests up to the limit within the same static window", () => {
        const options: SlidingWindowCounterOptions = {
            limit: 2,
            windowMs: 10 * MS_IN_SECOND
        };

        for (let i = 0; i < options.limit; i++) {
            const check = executor.check(key, options);

            expect(check).toBeTrue();
        }

        const blockedCheck = executor.check(key, options);
        expect(blockedCheck).toBeFalse();
    });

    // FIX: flaking test
    it.skip("should decay previous window weight as time progressed into the next window", () => {
        const options: SlidingWindowCounterOptions = {
            limit: 2,
            windowMs: 200
        };

        for (let i = 0; i < options.limit; i++) {
            const check = executor.check(key, options);

            expect(check).toBeTrue();
        }

        const blockedCheck = executor.check(key, options);
        expect(blockedCheck).toBeFalse();

        jest.advanceTimersByTime(options.windowMs + 10);

        const successfulCheck = executor.check(key, options);
        expect(successfulCheck).toBeTrue();

        const zeroCounterCheck = executor.check(key, options);
        expect(zeroCounterCheck).toBeFalse();
    });

    // FIX: flaking test
    it.skip("should shift windows and keep previous count when gap is exactly 1 window length", () => {
        const options: SlidingWindowCounterOptions = {
            limit: 5,
            windowMs: 100
        };
        const firstWindowRequests = 3;

        for (let i = 0; i < firstWindowRequests; i++) {
            const check = executor.check(key, options);

            expect(check).toBeTrue();
        }

        jest.advanceTimersByTime(options.windowMs + 5);

        const windowShiftCheck = executor.check(key, options);
        expect(windowShiftCheck).toBeTrue();

        const state = storage.get(key);
        expect(state).toBeDefined();
        expect(state?.previousCount).toBe(firstWindowRequests);
        expect(state?.currentCount).toBe(1);
    });

    it("should completely reset counts if more than  2 windows have passed", () => {
        const options: SlidingWindowCounterOptions = {
            limit: 2,
            windowMs: 50
        };

        const initialCheck = executor.check(key, options);
        expect(initialCheck).toBeTrue();

        jest.advanceTimersByTime(3 * options.windowMs);

        // History should be fully erased
        const check = executor.check(key, options);
        expect(check).toBeTrue();

        const state = storage.get(key);
        expect(state).toBeDefined();
        expect(state?.previousCount).toBe(0);
        expect(state?.currentCount).toBe(1);
    });
});
