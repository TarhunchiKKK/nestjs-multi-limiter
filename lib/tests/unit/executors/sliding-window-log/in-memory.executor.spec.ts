import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Test } from "@nestjs/testing";
import { STORAGE_TOKEN } from "../../../../src/di";
import { SlidingWindowLogInMemoryExecutor, type SlidingWindowLogOptions, type SlidingWindowLogState } from "../../../../src/executors";
import { clearMock, createInMemoryStorageMock, MS_IN_SECOND } from "../../../shared";

describe("SlidingWindowLogInMemoryExecutor", () => {
    let executor: SlidingWindowLogInMemoryExecutor;
    const storageMock = createInMemoryStorageMock<SlidingWindowLogState>();
    const key = "rate-limiter:sliding-window-log:key:scope";

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                SlidingWindowLogInMemoryExecutor,
                {
                    provide: STORAGE_TOKEN,
                    useValue: storageMock
                }
            ]
        }).compile();

        executor = module.get(SlidingWindowLogInMemoryExecutor);
    });

    afterEach(() => {
        clearMock(storageMock);
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

        const timestamps = storageMock.get(key);
        expect(timestamps).toBeDefined();
        expect(timestamps?.length).toBe(options.limit);
    });

    it("should release slots one by one as timestamps slide out of the window", async () => {
        const options: SlidingWindowLogOptions = {
            limit: 2,
            windowMs: 300
        };

        const initialCheck = executor.check(key, options);
        expect(initialCheck).toBeTrue();

        await Bun.sleep(100);

        const lastAllowedCheck = executor.check(key, options);
        expect(lastAllowedCheck).toBeTrue();

        await Bun.sleep(210);

        const newCheck = executor.check(key, options);
        expect(newCheck).toBeTrue();

        const timestamps = storageMock.get(key);
        expect(timestamps).toBeDefined();
        expect(timestamps?.length).toBe(2);
    });

    it("should completely clear logs if the time gap is larger than windowMS", async () => {
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

        await Bun.sleep(70);

        const successfulCheck = executor.check(key, options);
        expect(successfulCheck).toBeTrue();

        const timestamps = storageMock.get(key);
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

        const timestamps = storageMock.get(key);
        expect(timestamps).toBeDefined();
        expect(timestamps?.length).toBe(concurrentRequests);
        expect(timestamps?.[0]).toBeLessThanOrEqual(Date.now());
    });
});
