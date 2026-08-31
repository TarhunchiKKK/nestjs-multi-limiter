import type { INestApplication } from "@nestjs/common";
import type { ApiResponseOptions } from "@nestjs/swagger";
import type { RateLimitOptions } from "../decorators";

export type RateLimiterSwaggerPatchFn = (app: INestApplication, options: RateLimitOptions) => ApiResponseOptions;

export type RateLimiterSwaggerConfig = {
    transform?: (app: INestApplication, options: RateLimitOptions) => ApiResponseOptions;

    excludeRoutes?: string[];

    explicitOnly?: boolean;
};

export type RateLimiterSwaggerFullConfig = RateLimiterSwaggerConfig & {
    app: INestApplication;
};
