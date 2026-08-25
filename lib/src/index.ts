export type { IRateLimiterModuleOptionsFactory, RateLimiterModuleAsyncOptions, RateLimiterModuleOptions } from "./config";
export { ErrorFactory, type ErrorFactoryOptions, type IErrorFactory } from "./custom/error-factories";
export { type IKeyExtractor, KeyExtractor } from "./custom/key-extractors";
export { type IOptionsFactory, OptionsFactory } from "./custom/options-factories";
export { RateLimit, type RateLimitOptions, RejectRateLimit, SkipRateLimit } from "./decorators";
export { RateLimitGuard } from "./rate-limit.guard";
export { RateLimiterModule } from "./rate-limiter.module";
export type { IRedisAdapter, Key, Scope, StorageTypes, Strategies } from "./shared/model";
