import { type CanActivate, type ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { StrategyOptions } from "./config";
import type { ErrorFactoryOptions, IErrorFactory } from "./custom/error-factories";
import type { IKeyExtractor } from "./custom/key-extractors";
import { RateLimit, type RateLimitNormalizedOptions, type RateLimitOptions, SkipRateLimit } from "./decorators";
import { normalizeOptions } from "./decorators/rate-limit.decorator";
import { GUARD_OPTIONS_TOKEN } from "./di";
import { ProvidersResolver } from "./services/providers.resolver";
import { getKey, type Key, type Scope } from "./shared/model";

export type RateLimitGuardOptions = Required<Pick<RateLimitOptions, "scope" | "keyExtractor" | "errorFactory">> &
    Pick<RateLimitOptions, "factory"> &
    StrategyOptions;

type RunOptions = StrategyOptions & {
    scope: Scope;
    keyExtractor: IKeyExtractor;
    errorFactory: IErrorFactory;
};

/**
 * Guard that executes rate limiting checks on handlers.
 *
 * @publicApi
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
    public constructor(
        @Inject(GUARD_OPTIONS_TOKEN) private readonly options: RateLimitGuardOptions,
        @Inject(ProvidersResolver) private readonly providersResolver: ProvidersResolver,
        @Inject(Reflector) private readonly reflector: Reflector
    ) {}

    public async canActivate(context: ExecutionContext) {
        const metadataOptions = this.getMetadataOptions(context);
        if (metadataOptions === true) {
            return true;
        }

        const finalGuardOptions = await this.getFinalGuardOptions(context, metadataOptions);

        const key = await finalGuardOptions.keyExtractor.extract(context);

        const requestAllowed = await this.checkRate(key, finalGuardOptions);

        if (!requestAllowed) {
            await this.rejectWithError(context, key, finalGuardOptions);
        }

        return true;
    }

    private getMetadataOptions(context: ExecutionContext): RateLimitOptions | true | undefined {
        const handler = context.getHandler();
        const targetClass = context.getClass();

        const handlerSkip = this.reflector.get(SkipRateLimit, handler);
        if (handlerSkip) {
            return true;
        }

        const handlerOptions = this.reflector.get(RateLimit, handler);
        if (handlerOptions) {
            const classOptions = this.reflector.get(RateLimit, targetClass);

            if (!classOptions) {
                return handlerOptions;
            }

            return {
                ...classOptions,
                ...handlerOptions
            };
        }

        const classSkip = this.reflector.get(SkipRateLimit, targetClass);
        if (classSkip) {
            return true;
        }

        const classOptions = this.reflector.get(RateLimit, targetClass);
        return classOptions;
    }

    private async getFinalGuardOptions(context: ExecutionContext, metadataOptions?: RateLimitOptions): Promise<RunOptions> {
        if (!metadataOptions) {
            const factory = this.options.factory ? await this.providersResolver.getOptionsFactory(this.options.factory) : undefined;

            return {
                ...this.options,
                ...(factory ? await factory.getOptions(context) : undefined),
                keyExtractor: await this.providersResolver.getKeyExtractor(this.options.keyExtractor),
                errorFactory: await this.providersResolver.getErrorFactory(this.options.errorFactory)
            };
        }

        const keyExtractorToken = metadataOptions.keyExtractor ?? this.options.keyExtractor;
        const errorFactoryToken = metadataOptions.errorFactory ?? this.options.errorFactory;
        const optionsFactoryToken = metadataOptions.factory ?? this.options.factory;

        let finalDecoratorOptions: RateLimitNormalizedOptions = metadataOptions;
        if (optionsFactoryToken) {
            const optionsFactoryInstance = await this.providersResolver.getOptionsFactory(optionsFactoryToken);

            const dynamicOptions = await optionsFactoryInstance.getOptions(context);

            finalDecoratorOptions = {
                ...normalizeOptions(dynamicOptions),
                ...metadataOptions
            };
        }

        return {
            scope: finalDecoratorOptions.scope ?? this.options.scope,
            keyExtractor: await this.providersResolver.getKeyExtractor(keyExtractorToken),
            errorFactory: await this.providersResolver.getErrorFactory(errorFactoryToken),
            strategy: finalDecoratorOptions.strategy ?? this.options.strategy,
            strategyOptions: !finalDecoratorOptions.strategy
                ? this.options.strategyOptions
                : {
                      ...this.options.strategyOptions,
                      [finalDecoratorOptions.strategy]: {
                          ...this.options.strategyOptions[finalDecoratorOptions.strategy],
                          ...finalDecoratorOptions.strategyOptions?.[finalDecoratorOptions.strategy]
                      }
                  }
        };
    }

    private async checkRate(key: unknown, options: RunOptions) {
        const finalKey = getKey(key, options.strategy, options.scope);

        const executor = this.providersResolver.getExecutor(options.strategy);

        return await executor.check(finalKey, options.strategyOptions[options.strategy]);
    }

    private async rejectWithError(context: ExecutionContext, key: Key, options: RunOptions) {
        const errorOptions: ErrorFactoryOptions = {
            key: key,
            scope: options.scope,
            strategy: options.strategy,
            strategyOptions: options.strategyOptions[options.strategy]
        };

        const error = await options.errorFactory.getError(context, errorOptions);

        throw error;
    }
}
