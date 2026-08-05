export type { RateLimiterModuleAsyncOptions, RateLimiterModuleOptions, RateLimitOptions } from "./config/options";
export { ErrorFactory, type ErrorFactoryOptions, type IErrorFactory } from "./custom/error-factories";
export { type IKeyExtractor, KeyExtractor } from "./custom/key-extractors";
export { type IOptionsFactory, OptionsFactory } from "./custom/options-factories";
export { RateLimit, SkipRateLimit } from "./decorators";
export { RateLimitGuard } from "./middleware";
export { RateLimiterModule } from "./rate-limiter.module";
export type { IRedisAdapter, Key, Scope, StorageTypes, Strategies } from "./shared/model";
