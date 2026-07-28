import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { Test } from "@nestjs/testing";
import { STORAGE_TOKEN } from "../../../../src/di";
import { SlidingWindowLogInMemoryExecutor, type SlidingWindowLogOptions, type SlidingWindowLogState } from "../../../../src/executors";
import type { InMemoryStorage } from "../../../../src/shared/model";
import { createInMemoryStorage, MS_IN_SECOND } from "../../../shared";

describe("SlidingWindowLogInMemoryExecutor", () => {
    let executor: SlidingWindowLogInMemoryExecutor;
    let storage: InMemoryStorage<SlidingWindowLogState>;
    const key = "rate-limiter:sliding-window-log:key:scope";

    beforeEach(async () => {
        storage = createInMemoryStorage<SlidingWindowLogState>();

        const module = await Test.createTestingModule({
            providers: [
                SlidingWindowLogInMemoryExecutor,
                {
                    provide: STORAGE_TOKEN,
                    useValue: storage
                }
            ]
        }).compile();

        executor = module.get(SlidingWindowLogInMemoryExecutor);

        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should allow requests up to the limit and then deny them", () => {
        const options: SlidingWindowLogOptions = {
            limit: 3,
            windowMs: 5 * MS_IN_SECOND
        };

        for (let i = 0; i < options.limit; i++) {
            const check = executor.check(key, options);

            expect(check).toBeTrue();
        }

        const blockedCheck = executor.check(key, options);
        expect(blockedCheck).toBeFalse();

        const timestamps = storage.get(key);
        expect(timestamps).toBeDefined();
        expect(timestamps?.length).toBe(options.limit);
    });

    it("should release slots one by one as timestamps slide out of the window", () => {
        const options: SlidingWindowLogOptions = {
            limit: 2,
            windowMs: 300
        };

        const initialCheck = executor.check(key, options);
        expect(initialCheck).toBeTrue();

        jest.advanceTimersByTime(100);

        const lastAllowedCheck = executor.check(key, options);
        expect(lastAllowedCheck).toBeTrue();

        jest.advanceTimersByTime(210);

        const newCheck = executor.check(key, options);
        expect(newCheck).toBeTrue();

        const timestamps = storage.get(key);
        expect(timestamps).toBeDefined();
        expect(timestamps?.length).toBe(2);
    });

    it("should completely clear logs if the time gap is larger than windowMS", () => {
        const options: SlidingWindowLogOptions = {
            limit: 2,
            windowMs: 50
        };

        for (let i = 0; i < options.limit; i++) {
            const check = executor.check(key, options);

            expect(check).toBeTrue();
        }

        const blockedCheck = executor.check(key, options);
        expect(blockedCheck).toBeFalse();

        jest.advanceTimersByTime(70);

        const successfulCheck = executor.check(key, options);
        expect(successfulCheck).toBeTrue();

        const timestamps = storage.get(key);
        expect(timestamps).toBeDefined();
        expect(timestamps?.length).toBe(1);
    });

    it("should handle concurrent synchronous requests correctly", () => {
        const options: SlidingWindowLogOptions = {
            limit: 5,
            windowMs: 5 * MS_IN_SECOND
        };
        const concurrentRequests = 3;

        for (let i = 0; i < concurrentRequests; i++) {
            const check = executor.check(key, options);

            expect(check).toBeTrue();
        }

        const timestamps = storage.get(key);
        expect(timestamps).toBeDefined();
        expect(timestamps?.length).toBe(concurrentRequests);
        expect(timestamps?.[0]).toBeLessThanOrEqual(Date.now());
    });
});
