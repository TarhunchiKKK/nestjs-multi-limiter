import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Test } from "@nestjs/testing";
import { STORAGE_TOKEN } from "../../../../src/di";
import { FixedWindowInMemoryExecutor, type FixedWindowOptions, type FixedWindowState } from "../../../../src/executors";
import { clearMock, createInMemoryStorageMock, MS_IN_DAY, TOMORROW, YESTERDAY } from "../../../shared";

describe("FixedWindowInMemoryExecutor", () => {
    let executor: FixedWindowInMemoryExecutor;
    const storageMock = createInMemoryStorageMock<FixedWindowState>();

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                FixedWindowInMemoryExecutor,
                {
                    provide: STORAGE_TOKEN,
                    useValue: storageMock
                }
            ]
        }).compile();

        executor = module.get(FixedWindowInMemoryExecutor);
    });

    afterEach(() => {
        clearMock(storageMock);
    });

    describe("allow request", () => {
        it("should find valid state", () => {
            const key = crypto.randomUUID();
            const options: FixedWindowOptions = {
                limit: 100,
                ttl: MS_IN_DAY
            };
            const state: FixedWindowState = {
                count: 10,
                resetTime: TOMORROW
            };

            storageMock.get.mockReturnValue(state);

            const result = executor.check(key, options);

            expect(result).toBeTrue();
        });

        it("should find state with resetTime left", () => {
            const key = crypto.randomUUID();
            const options: FixedWindowOptions = {
                limit: 100,
                ttl: MS_IN_DAY
            };
            const state: FixedWindowState = {
                count: 10,
                resetTime: YESTERDAY
            };

            storageMock.get.mockReturnValue(state);

            const result = executor.check(key, options);

            expect(result).toBeTrue();
        });

        it("should not found state", () => {
            const key = crypto.randomUUID();
            const options: FixedWindowOptions = {
                limit: 100,
                ttl: MS_IN_DAY
            };

            storageMock.get.mockReturnValue(undefined);

            const result = executor.check(key, options);

            expect(result).toBeTrue();
        });
    });

    describe("disallow request", () => {
        it("should found state with limit === count", () => {
            const key = crypto.randomUUID();
            const options: FixedWindowOptions = {
                limit: 10,
                ttl: MS_IN_DAY
            };
            const state: FixedWindowState = {
                count: 10,
                resetTime: TOMORROW
            };

            storageMock.get.mockReturnValue(state);

            const result = executor.check(key, options);

            expect(result).toBeFalse();
        });

        it("should found state with limit <= count", () => {
            const key = crypto.randomUUID();
            const options: FixedWindowOptions = {
                limit: 10,
                ttl: MS_IN_DAY
            };
            const state: FixedWindowState = {
                count: 20,
                resetTime: TOMORROW
            };

            storageMock.get.mockReturnValue(state);

            const result = executor.check(key, options);

            expect(result).toBeFalse();
        });
    });
});
