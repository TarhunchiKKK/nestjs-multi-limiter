<p align="center">
    <a href="http://nestjs.com/" target="blank">
        <img src="https://docs.nestjs.com/assets/logo-small-gradient.svg" width="200" alt="Nest Logo" />
    </a>
</p>

<p align="center">
    A rate limiter module for <a href="http://nestjs.com/">NestJS</a> framework (Node.js).
</p>

<p align="center">
<a href="https://github.com/tarhunchikkk/nestjs-multi-limiter/actions/workflows/ci.yml"><img src="https://github.com/tarhunchikkk/nestjs-multi-limiter/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
<a href="https://github.com/tarhunchikkk/nestjs-multi-limiter/actions/workflows/e2e.yml"><img src="https://github.com/tarhunchikkk/nestjs-multi-limiter/actions/workflows/e2e.yml/badge.svg" alt="E2e" /></a>
<a href="https://github.com/tarhunchikkk/nestjs-multi-limiter/actions/workflows/codeql-analysis.yml"><img src="https://github.com/tarhunchikkk/nestjs-multi-limiter/actions/workflows/codeql-analysis.yml/badge.svg" alt="CodeQL Analysis" /></a>
<a href="https://biomejs.dev/"><img src="https://img.shields.io/badge/code_style-XO-60a5fa.svg" alt="Code Style" /></a>
<a href="https://biomejs.dev/"><img src="https://img.shields.io/badge/styled_with-Biome-60a5fa.svg" alt="Formatter" /></a>
<a href="https://www.npmjs.com/package/nestjs-multi-limiter"><img src="https://img.shields.io/npm/l/nestjs-multi-limiter.svg" alt="Package License" /></a>
</p>

## Features

- **NestJS Native**: Dependency injection and async configuration.
- **5 Core Algorithms**: _Fixed Window_, _Token Bucket_, _Sliding Window Counter_, _Sliding Window Log_ and _Leaky Bucket_.
- **Different Storages**: In-memory (`Map`) and <a href="https://redis.io/?ref=soroushjp.com">Redis</a> (With <a href="https://www.lua.org/">Lua</a> scripts) storages.
- **Runtime Configuration:** The system of options factories allows dynamically configure limits at runtime per request context (e.g., based on JWT user roles or pricing tiers).
- **Driver-Agnostic Storage:** <a href="https://redis.io/?ref=soroushjp.com">Redis</a> integration is completely decoupled from specific npm packages (like `ioredis` or `node-redis`).   
- **Redis Failure Handling:** _Fail-Open_, _Fail-Close_ and _Fail-Fast_ strategies
- **Race-Condition Safe:** Powered Redis storage by execution <a href="https://www.lua.org/">Lua</a> scripts, preventing race conditions in multi-instant deployments.
- **Protocol Agnosticism:** Ability to implement custom key extractors and error factories allows you to integrate the library with any protocol.
- **Zero Memory Leaks:** An automatic background garbage collection provider for the In-Memory storage (`Map`), fully tied to <a href="http://nestjs.com/">NestJS</a> lifecycle hooks.
- **Swagger Integration:** Native integration with <a href="https://www.npmjs.com/package/@nestjs/swagger">@nestjs/swagger</a> package with ability to customize metadata in Swagger docs.

👉 [See Documentation](https://tarhunchikkk.github.io/nestjs-multi-limiter/)

👉 [See Example App](https://github.com/TarhunchiKKK/nestjs-multi-limiter/tree/main/sample)

## Installation

```bash
npm install nestjs-multi-limiter
```

## Quick Start

Add `RateLimiterModule` to your `AppModule` imports:

```typescript
import { Module } from "@nestjs/common";
import { RateLimiterModule } from "nestjs-multi-limiter";
import { AppController } from "./app.controller.ts";

@Module({
    imports: [
        RateLimiterModule.forRoot({
            storage: {
                type: "in-memory",
            },
            scope: "my-scope",
            strategy: "token-bucket",
            strategyOptions: {
                // different strategies options (Optional)
            },
        }),
    ],
    controllers: [AppController],
})
export class AppModule {}
```

Use `RateLimitGuard` in your controller. 

You also can add `@RateLimit` decorator to override default options.

```typescript
import { Controller, Get, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard } from "nestjs-multi-limiter";

@Controller()
@UseGuards(RateLimitGuard)
@RateLimit({ strategy: "fixed-window", options: { /* override default options */ } })
export class AppController {
    @Get("/hello")
    @RateLimit({ strategy: "fixed-window", options:{ /* merge with controller options */ } })
    public hello() {
        return "Hello";
    }
}
```

👉 [See Documentation](https://tarhunchikkk.github.io/nestjs-multi-limiter/)

## License

This library is [MIT licensed](license).
