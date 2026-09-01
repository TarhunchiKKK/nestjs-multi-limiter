# Changelog

## 2.2.0 (Sep 1, 2026)

### Added

- Integration with [@nestjs/swagger](https://www.npmjs.com/package/@nestjs/swagger) package with ability to customize `429` api response metadata

## 2.1.0 (Aug 31, 2026)

### Added

- Request-scoped providers support
- Transient-scoped providers support

### Improved

- Added batching for "dead" in-memory data garbage collector

## 2.0.0 (Aug 28, 2026)

### Added

- Dynamic rate limiting bypassing
- `@RejectRateLimit` decorator

### Breaking Changes

- `@RateLimit` decorator options type
- `onError` method name (now `handleError`) and signature of `IRedisAdapter` interface

## 1.2.0 (Aug 21, 2026)

### Added

- `Redis` failure handling
- `RateLimiterModule` async configuration via `useClass` syntax
- `RateLimiterModule` async configuration via `useExisting` syntax

### Fixed

- Typing for `IErrorFactory` interface

## 1.1.0 (Aug 19, 2026)

### Added

- Validation for `RateLimitModule` configuration
- `@RateLimit` decorator options merging
- Validation for Lua-scripts return values (expected only `0` or `1`)

### Fixed

- Simplification for `IRedisAdapter` type