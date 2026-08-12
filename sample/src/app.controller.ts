import { Controller, Get, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard, type RateLimitOptions } from "nestjs-multi-limiter";
import { IpKeyExtractor } from "./shared/ip.key-extractor";
import { MS_IN_MINUTE } from "./shared/time.constants";

const HEALTH_RATE_LIMIT_OPTIONS: RateLimitOptions = {
    // 📌 This options use default scope
    strategy: "fixed-window",
    limit: 100,
    ttl: 1 * MS_IN_MINUTE,
    keyExtractor: IpKeyExtractor
};

@Controller()
@UseGuards(RateLimitGuard)
export class AppController {
    @Get("health")
    @RateLimit(HEALTH_RATE_LIMIT_OPTIONS)
    public health() {
        return { ok: true };
    }
}
