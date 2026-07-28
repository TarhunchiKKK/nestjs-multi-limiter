import { Inject, Injectable, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";
import { InjectStorage, MODULE_OPTIONS_TOKEN } from "../di";
import { BaseStrategyState, InMemoryStorage } from "../shared/model";
import { RateLimiterModuleOptions } from "../config/options";

@Injectable()
export class InMemoryGarbageCollector implements OnApplicationBootstrap, OnApplicationShutdown {
    private intervalRef: NodeJS.Timeout | null = null;

    public constructor(
        @InjectStorage() private readonly storage: InMemoryStorage<BaseStrategyState>,
        @Inject(MODULE_OPTIONS_TOKEN) private readonly options: RateLimiterModuleOptions
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
        this.intervalRef = setInterval(() => {
            this.collect();
            // FIX: valid interval
        }, 1_000_000);
    }

    public onApplicationShutdown() {
        if (this.intervalRef) {
            clearInterval(this.intervalRef);
        }
    }
}
