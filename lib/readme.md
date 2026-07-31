<p align="center">
    <a href="http://nestjs.com/" target="blank">
        <img src="https://docs.nestjs.com/assets/logo-small-gradient.svg" width="200" alt="Nest Logo" />
    </a>
</p>

<p align="center">
    A rate limiter module for <a href="http://nestjs.com/">NestJS</a> framework (Node.js).
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/nestjs-rate-limitr">
        <img src="https://img.shields.io/npm/v/nestjs-rate-limitr.svg" alt="NPM Version" />
    </a>
    <a href="https://www.npmjs.com/package/nestjs-rate-limitr">
        <img src="https://img.shields.io/npm/l/nestjs-rate-limitr.svg" alt="Package License" />
    </a>
    <a href="https://www.npmjs.com/package/nestjs-rate-limitr">
        <img src="https://img.shields.io/npm/dm/nestjs-rate-limitr.svg" alt="NPM Downloads" />
    </a>
</p>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Features](#features)
- [Algorithms Reference](#algorithms-reference)
  - [Comprehensive Guides](#comprehensive-guides)
  - [Use Cases](#use-cases)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
  - [Module Configuration](#module-configuration)
  - [Default Module Options](#default-module-options)
  - [Decorator Options](#decorator-options)
- [Custom Providers](#custom-providers)
  - [Key Extractors](#key-extractors)
  - [Error Factories](#error-factories)
  - [Options Factories](#options-factories)
- [Techniques](#techniques)
  - [Async Configuration](#async-configuration)
  - [Redis Integration](#redis-integration)
    - [Via Object](#via-object)
    - [Via Provider](#via-provider)
  - [Skipping](#skipping)
- [License](#license)

## Features

- **NestJS Native**: Dependency injection and async configuration.
- **Different limiting strategies**: _Fixed Window_, _Token Bucket_, _Sliding Window Counter_, _Sliding Window Log_ and _Leaky Bucket_.
- **Different Storages**: In-memory (Map) and <a href="https://redis.io/?ref=soroushjp.com">Redis</a> (With <a href="https://www.lua.org/">Lua</a> scripts).
- **Custom Key Extractors**: Provide your custom key extraction logic.
- **Custom Error Factories**: Customize you rate limit exhausted error.
- **Dynamic Configuration**: Provide dynamic rate limiting options.

## Algorithms Reference

### Comprehensive Guides

This library implements 5 core rate limiting strategies. To understand their trade-offs, behaviors, and memory footprints, check out these excellent resources:

- **[ByteByteGo (Alex Xu): Design a Rate Limiter](https://bytebytego.com/courses/system-design-interview/design-a-rate-limiter)** — The gold standard from the author of _System Design Interview_. It features clear mental models, visual diagrams, and pros/cons for **Token Bucket**, **Leaky Bucket**, **Fixed Window**, **Sliding Window Log**, and **Sliding Window Counter**.
- **[Arcjet Blog: Rate Limiting Algorithms Compared](https://blog.arcjet.com/rate-limiting-algorithms-token-bucket-vs-sliding-window-vs-fixed-window/)** — An exceptional production-oriented breakdown. It provides a perfect mental model: **Token Bucket** tracks capacity, **Sliding Windows** track recent history, and **Fixed Windows** represent discrete accounting.
- **[Medium: Rate Limiting Algorithms Explained](https://medium.com/@erwindev/rate-limiting-algorithms-compared-token-bucket-leaky-bucket-and-sliding-window-log-acd9c44bc86f)** — A great code-centric walk-through that tracks request state and explains why **Sliding Window Log** is highly accurate but memory-intensive.

### Use Cases

| Algorithm                  | Fairness              | Burst Tolerance           | Memory Cost | Best For                    |
| :------------------------- | :-------------------- | :------------------------ | :---------- | :-------------------------- |
| **Fixed Window**           | Low                   | High at window boundaries | Very Low    | Simple internal limits      |
| **Token Bucket**           | Medium to High        | Controlled bursts         | Low         | Developer-facing APIs       |
| **Sliding Window Counter** | Medium to High        | Low to Medium             | Moderate    | Scalable public APIs        |
| **Sliding Window Log**     | High                  | Low                       | High        | Strict fairness enforcement |
| **Leaky Bucket**           | High output smoothing | None                      | Low         | Traffic shaping             |

## Installation

```bash
npm install nestjs-rate-limiter
```

## Quick Start

```typescript
// app.module.ts
import { Module } from "@nestjs/common";
import { RateLimiterModule } from "nestjs-rate-limiter";
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

```typescript
// app.controller.ts
import { Controller, Get, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard } from "nestjs-rate-limiter";

@Controller()
@UseGuards(RateLimitGuard)
export class AppController {
    @Get("/hello")
    @RateLimit({ /* override default options */ })
    public hello() {
        return "Hello";
    }
}
```

## Configuration

### Module Configuration

There is only one required field in configuration - `storage`.

```typescript
RateLimiterModule.forRoot({
    scope: "my-scope",

    // storage configuration (Map or Redis)
    storage: {
        type: "in-memory",
        gcTime: 15 * 60 * 1000, // time to clear `old` data from memory
    },

    // strategy configuration
    strategy: "token-bucket",
    strategyOptions: {
        fixedWindow: {
            // strategy-specific options
        },
        tokenBucket: {
            // strategy-specific options
        },
        slidingWindowCounter: {
            // strategy-specific options
        },
        slidingWindowLog: {
            // strategy-specific options
        },
        leakyBucket: {
            // strategy-specific options
        },
    },

    // default providers
    defaultProviders: {
        keyExtractor: undefined,
        errorFactory: undefined,
        optionsFactory: undefined,
    },
});
```

### Default Module Options

Your custom options will be merged with this:

```typescript
{
    scope: "default-scope",
    storage: {
        type: "in-memory",
        gcTime: 15 * 60 * 1000,
    },
    strategy: "fixed-window",
    strategyOptions: {
        fixedWindow: {
            limit: 100,
            ttl: MS_IN_MINUTE
        },
        slidingWindowCounter: {
            limit: 100,
            windowMs: MS_IN_MINUTE
        },
        slidingWindowLog: {
            limit: 50,
            windowMs: MS_IN_MINUTE
        },
        tokenBucket: {
            capacity: 20,
            refillRate: 5 / MS_IN_MINUTE,
            ttl: 3 * MS_IN_MINUTE
        },
        leakyBucket: {
            capacity: 10,
            leakRate: 2 / MS_IN_MINUTE,
            ttl: 3 * MS_IN_MINUTE
        }
    },
    defaultProviders: {
        keyExtractor: BuiltinKeyExtractor,  // IP-address is used as key
        errorFactory: BuiltinErrorFactory,  // throws HttpException (from @nestjs/common)
        optionsFactory: undefined           // no dynamic options by default
    }
}
```

### Decorator Options

By default guard uses options provided in `RateLimiterModule` configuration. You can override this options in decorator:

```typescript
import {
    MyCustomKeyExtractor,
    MyCustomErrorFactory,
    MyCustomOptionsFactory
} from "./providers"

@RateLimit({
    scope: "my-custom-scope",

    keyExtractor: MyCustomKeyExtractor,
    errorFactory: MyCustomErrorFactory,
    factory: MyCustomOptionsFactory,

    // strategy-specific options
    strategy: "sliding-window-counter",
    limit: 100,
    windowMs: 1_000
})
```

## Custom Providers

> ⚠️ Important ⚠️
>
> Your custom providers (key extractors, error factories and options factories) will be called on every request.
> Do not perform any expensive computations here. It can significantly hurt performance.

> 📌 **Remember**
>
> If you specify you custom providers (key extractors, error factories and options factories) as default providers in `RateLimiterModule` configuration it will become not required to specify them in `RateLimit` decorator.

### Key Extractors

1. Define your custom key extractor:

```typescript
import { type ExecutionContext } from "@nestjs/common";
import { type IKeyExtractor, KeyExtractor } from "nestjs-rate-limiter";

@KeyExtractor()
export class MyCustomKeyExtractor implements IKeyExtractor {
    public constructor(private readonly jwtService: JwtService) {}

    public extract(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();

        const authorization = request.headers["Authorization"];

        const [, token] = authorization.split(" ")[1];

        const { userId } = this.jwtService.verify(token);

        return userId;
    }
}
```

2. List your key extractor as your module provider:

```typescript
MyModule.forRoot({
    // ...
    providers: [MyCustomKeyExtractor],
});
```

3. Specify your custom key extractor in decorator:

```typescript
@RateLimit({
    // ...
    keyExtractor: MyCustomKeyExtractor
})
```

### Error Factories

1. Define your custom error factory:

```typescript
import { type ExecutionContext, HttpException } from "@nestjs/common";
import {
    ErrorFactory,
    type ErrorFactoryOptions,
    type IErrorFactory,
} from "nestjs-rate-limiter";

export class RateLimitError extends HttpException {
    public constructor(message: string) {
        super(message, 429);
    }
}

@ErrorFactory()
export class MyCustomErrorFactory implements IErrorFactory {
    public constructor(/* You can use any providers */) {}

    public getError(context: ExecutionContext, options: ErrorFactoryOptions) {
        return new RateLimitError(
            `Rate limit exhausted on ${context.getType()} transporter for scope "${options.scope}" and key "${options.key}".`,
        );
    }
}
```

2. List your error factory as your module provider:

```typescript
MyModule.forRoot({
    // ...
    providers: [MyCustomErrorFactory],
});
```

3. Specify your custom error factory in decorator:

```typescript
@RateLimit({
    // ...
    errorFactory: MyCustomErrorFactory
})
```

### Options Factories

1. Define your custom options factory:

```typescript
import { type ExecutionContext } from "@nestjs/common";
import { type IOptionsFactory, OptionsFactory } from "nestjs-rate-limiter";

@OptionsFactory()
export class MyCustomOptionsFactory implements IOptionsFactory {
    public constructor(private readonly configService: ConfigService) {}

    public getOptions(context: ExecutionContext) {
        const scope = this.configService.get("RATE_LIMITER_SCOPE") ?? "custom-scope";

        return { scope };
    }
}
```

2. List your options factory as your module provider:

```typescript
RateLimiterModule.forRoot({
    // ...
    providers: [MyCustomOptionsFactory],
});
```

3. Specify your custom options factory in decorator:

```typescript
@RateLimit({
    // ...
    factory: MyCustomOptionsFactory
})
```

> ⚠️ **Note**
>
> If `RateLimit` decorator has static options (like `scope`) this static options will override corresponding properties returned by `factory`.

## Techniques

### Async Configuration

```typescript
RateLimiterModule.forRootAsync({
    imports: [/* ... */],
    inject: [/* ... */],
    useFactory: (/* ... */) => ({
        // This options are same to `forRoot` method excluding `custom` property
    }),
});
```

### Redis Integration

For using Redis storage you need to create object or provider that implements `RedisAdapter` type.

> 📌 **Trick**
>
> `Redis` instance from  `ioredis` package already implements `RedisAdapter` type.
>
> You can use it as adapter.

#### Via Object

1. Setup your adapter object:

```typescript
import Redis, { type RedisValue } from "ioredis";
import type { RedisAdapter } from "nestjs-rate-limiter";

// 📌 TRICK: This client already can be used as adapter
export const RedisClient = new Redis(/* ... */);

export const MyRedisAdapter: RedisAdapter = {
    eval: async (script, numkeys, ...args) => {
        return await RedisClient.eval(script, numkeys, ...args);
    }
} 
```

2. Inject your Redis provider:

```typescript
RateLimiterModule.forRoot({
    storage: {
        type: "redis",
        adapter: MyRedisAdapter, // or use `RedisClient` directly
    },
    // ...
});
```

#### Via Provider

1. Setting up your provider:

```typescript
import Redis, { type RedisValue } from "ioredis";
import type { RedisAdapter } from "nestjs-rate-limiter";

@Injectable()
export class RedisService implements RedisAdapter {
    private readonly client: Redis;

    public constructor(private readonly configService: ConfigService) {
        this.client = new Redis(/* ... */);
    }

    public async eval(
        script: string | Buffer<ArrayBufferLike>,
        numkeys: string | number,
        ...args: RedisValue[]
    ) {
        return await this.client.eval(script, numkeys, ...args);
    }

    // 📌 TRICK: Redis client can be used as adapter
    public getClient() {
        return this.client;
    }
}
```

2. Register your module:

```typescript
@Module({
    providers: [RedisService],
    exports: [RedisService],
})
export class RedisModule {}
```

3. Inject your Redis provider:

```typescript
RateLimiterModule.forRootAsync({
    imports: [RedisModule],
    inject: [RedisService],
    useFactory: (redisService: RedisService) => ({
        storage: {
            type: "redis",
            adapter: RedisService, // or use `redisService.getClient()`
        },
        // ...
    }),
});
```

### Skipping

You can also skip rate limiting for method/controller:

```typescript
import { RateLimitGuard, SkipRateLimit } from "nestjs-rate-limiter";

@Controller()
@UseGuards(RateLimitGuard)
export class MyController {
    public method1() {}

    // Rate limiting for this method will be skipped
    @SkipRateLimit()
    public method2() {}
}
```

## License

MIT
