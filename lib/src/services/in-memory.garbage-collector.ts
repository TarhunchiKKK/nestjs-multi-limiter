import { Inject, Injectable, type OnApplicationBootstrap, type OnApplicationShutdown } from "@nestjs/common";
import type { RateLimiterModuleFullOptions } from "../config/options";
import { InjectStorage, MODULE_OPTIONS_TOKEN } from "../di";
import type { BaseStrategyState, InMemoryStorage } from "../shared/model";

@Injectable()
export class InMemoryGarbageCollector implements OnApplicationBootstrap, OnApplicationShutdown {
    private intervalRef: NodeJS.Timeout | null = null;

    public constructor(
        @InjectStorage() private readonly storage: InMemoryStorage<BaseStrategyState>,
        @Inject(MODULE_OPTIONS_TOKEN) private readonly options: RateLimiterModuleFullOptions
    ) {}

    private collect() {
        const now = Date.now();

        for (const [key, state] of this.storage.entries()) {
            if (state.expiresAt < now) {
                this.storage.delete(key);
            }
        }
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
