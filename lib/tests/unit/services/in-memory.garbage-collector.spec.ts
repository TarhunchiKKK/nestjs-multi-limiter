import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import type { RateLimiterModuleFullOptions } from "../../../src/config/options";
import { InMemoryGarbageCollector } from "../../../src/services/in-memory.garbage-collector";
import type { BaseStrategyState, InMemoryStorage } from "../../../src/shared/model";
import { createInMemoryStorage, MS_IN_MINUTE, MS_IN_SECOND } from "../../shared";

const GC_TIME = MS_IN_MINUTE;

describe("InMemoryGarbageCollector", () => {
    let collector: InMemoryGarbageCollector;
    let storage: InMemoryStorage<BaseStrategyState>;

    beforeEach(async () => {
        storage = createInMemoryStorage();

        jest.useFakeTimers();
    });

    afterEach(() => {
        // biome-ignore lint/style/noNonNullAssertion: It is necessary for valid interval cleaning.
        if (collector!) {
            collector.onApplicationShutdown();
        }

        jest.useRealTimers();
    });

    it("should delete expired keys when interval triggers", () => {
        const options = {
            storage: {
                type: "in-memory",
                gcTime: GC_TIME
            } satisfies RateLimiterModuleFullOptions["storage"]
        };

        collector = new InMemoryGarbageCollector(storage, options as RateLimiterModuleFullOptions);
        collector.onApplicationBootstrap();

        const now = Date.now();
        storage.set("expired-1", { expiresAt: now + 5 * MS_IN_SECOND });
        storage.set("expired-2", { expiresAt: now + GC_TIME - 10 });
        storage.set("active", { expiresAt: now + GC_TIME + 5 * MS_IN_SECOND });

        jest.advanceTimersByTime(GC_TIME);

        expect(storage.get("active")).toBeDefined();
        expect(storage.get("expired-1")).not.toBeDefined();
        expect(storage.get("expired-1")).not.toBeDefined();
    });

    it("should not start interval if storage type is not `in-memory`", () => {
        const options = {
            storage: {
                type: "redis",
                adapter: {
                    eval: () => Promise.resolve(1)
                }
            } satisfies RateLimiterModuleFullOptions["storage"]
        };

        collector = new InMemoryGarbageCollector(storage, options as unknown as RateLimiterModuleFullOptions);
        collector.onApplicationBootstrap();

        storage.set("expired", { expiresAt: Date.now() - 5 * MS_IN_SECOND });

        jest.advanceTimersByTime(GC_TIME);

        expect(storage.get("expired")).toBeDefined();
    });
});
