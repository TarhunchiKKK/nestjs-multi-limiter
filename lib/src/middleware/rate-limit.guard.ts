import { type CanActivate, type ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { normalizeOptions } from "../config/helpers";
import type { RateLimitGuardOptions, RateLimitNormalizedOptions, StrategyOptions } from "../config/options";
import type { ErrorFactoryOptions, IErrorFactory } from "../custom/error-factories";
import type { IKeyExtractor } from "../custom/key-extractors";
import { RateLimit, SkipRateLimit } from "../decorators";
import { GUARD_OPTIONS_TOKEN } from "../di";
import { ProvidersResolver } from "../services/providers.resolver";
import { getKey, type Scope } from "../shared/model";

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
        @Inject(ProvidersResolver) private readonly discoveryService: ProvidersResolver,
        @Inject(Reflector) private readonly reflector: Reflector
    ) {}

    public async canActivate(context: ExecutionContext) {
        const skip = this.checkSkip(context);

        if (skip) {
            return true;
        }

        const options = await this.getOptions(context);

        const key = await options.keyExtractor.extract(context);

        const requestAllowed = await this.checkRate(key, options);

        if (!requestAllowed) {
            const errorOptions: ErrorFactoryOptions = {
                key: key,
                scope: options.scope,
                strategy: options.strategy,
                strategyOptions: options.strategyOptions[options.strategy]
            };

            throw options.errorFactory.getError(context, errorOptions);
        }

        return true;
    }

    private checkSkip(context: ExecutionContext) {
        const shouldSkip = this.reflector.getAllAndOverride(SkipRateLimit, [context.getHandler(), context.getClass()]);

        if (shouldSkip) {
            return true;
        }

        return false;
    }

    private async getOptions(context: ExecutionContext): Promise<RunOptions> {
        const options = this.reflector.getAllAndOverride(RateLimit, [context.getHandler(), context.getClass()]);

        if (!options) {
            return {
                ...this.options,
                keyExtractor: await this.discoveryService.getKeyExtractor(this.options.keyExtractor),
                errorFactory: await this.discoveryService.getErrorFactory(this.options.errorFactory)
            };
        }

        const keyExtractorToken = options.keyExtractor ?? this.options.keyExtractor;
        const errorFactoryToken = options.errorFactory ?? this.options.errorFactory;
        const optionsFactoryToken = options.factory ?? this.options.factory;

        let finalDecoratorOptions: RateLimitNormalizedOptions = options;
        if (optionsFactoryToken) {
            const optionsFactoryInstance = await this.discoveryService.getOptionsFactory(optionsFactoryToken);

            const dynamicOptions = await optionsFactoryInstance.getOptions(context);

            finalDecoratorOptions = {
                ...normalizeOptions(dynamicOptions),
                ...options
            };
        }

        return {
            scope: finalDecoratorOptions.scope ?? this.options.scope,
            keyExtractor: await this.discoveryService.getKeyExtractor(keyExtractorToken),
            errorFactory: await this.discoveryService.getErrorFactory(errorFactoryToken),
            strategy: finalDecoratorOptions.strategy ?? this.options.strategy,
            strategyOptions: !options.strategy
                ? this.options.strategyOptions
                : {
                      ...this.options.strategyOptions,
                      [options.strategy]: {
                          ...this.options.strategyOptions[options.strategy],
                          ...finalDecoratorOptions.strategyOptions?.[options.strategy]
                      }
                  }
        };
    }

    private async checkRate(key: unknown, options: RunOptions) {
        const finalKey = getKey(key, options.strategy, options.scope);

        const executor = this.discoveryService.getExecutor(options.strategy);

        return await executor.check(finalKey, options.strategyOptions[options.strategy]);
    }
}
