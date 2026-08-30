import { Inject, Injectable, type OnApplicationBootstrap, type OnApplicationShutdown } from "@nestjs/common";
import type { RateLimiterModuleFullOptions } from "../config";
import { InjectStorage, MODULE_OPTIONS_TOKEN } from "../di";
import type { BaseStrategyInMemoryState } from "../executors";
import type { InMemoryStorage } from "../shared/model";

@Injectable()
export class InMemoryGarbageCollector implements OnApplicationBootstrap, OnApplicationShutdown {
    private intervalRef: NodeJS.Timeout | null = null;
    private isCleaning = false;

    public constructor(
        @InjectStorage() private readonly storage: InMemoryStorage<BaseStrategyInMemoryState>,
        @Inject(MODULE_OPTIONS_TOKEN) private readonly options: RateLimiterModuleFullOptions
    ) {}

    private collect() {
        if (this.isCleaning) {
            return;
        }
        this.isCleaning = true;

        const now = Date.now();
        const iterator = this.storage.entries();

        const cleanBatch = () => {
            if (this.options.storage.type !== "in-memory") {
                return;
            }

            let processed = 0;

            while (processed < this.options.storage.gcBatchSize) {
                const { value, done } = iterator.next();

                if (done) {
                    this.isCleaning = false;
                    return;
                }

                const [key, state] = value;
                if (state.expiresAt < now) {
                    this.storage.delete(key);
                }

                processed++;
            }

            setImmediate(cleanBatch);
        };

        cleanBatch();
    }

    public onApplicationBootstrap() {
        if (this.options.storage.type !== "in-memory") {
            return;
        }

        this.intervalRef = setInterval(() => {
            this.collect();
        }, this.options.storage.gcTime);
    }

    public onApplicationShutdown() {
        if (this.intervalRef) {
            clearInterval(this.intervalRef);
        }
    }
}
