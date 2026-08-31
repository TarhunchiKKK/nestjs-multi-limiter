import { type CanActivate, type ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { type ContextId, ContextIdFactory, Reflector } from "@nestjs/core";
import type { StrategyOptions } from "./config";
import type { ErrorFactoryOptions, IErrorFactory } from "./custom/error-factories";
import type { IKeyExtractor } from "./custom/key-extractors";
import type { DynamicRateLimitOptions } from "./custom/options-factories";
import type { RateLimitOptions } from "./decorators";
import { RATE_LIMIT_METADATA } from "./decorators/rate-limit.decorator";
import { GUARD_OPTIONS_TOKEN } from "./di";
import { ProvidersResolver } from "./services/providers.resolver";
import { type BypassStrategies, getKey, type Key, type Scope } from "./shared/model";

export type RateLimitGuardOptions = Required<Pick<RateLimitOptions, "scope" | "keyExtractor" | "errorFactory">> &
    Pick<RateLimitOptions, "factory"> &
    StrategyOptions;

type RunOptions = StrategyOptions & {
    scope: Scope;
    bypass?: BypassStrategies;
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

        if (metadataOptions?.bypass === "skip") {
            return true;
        }

        const finalGuardOptions = await this.getFinalGuardOptions(context, metadataOptions);

        switch (finalGuardOptions.bypass) {
            case "skip":
                return true;
            case "reject":
                await this.rejectWithError(context, undefined, finalGuardOptions);
                break;
        }

        const key = await finalGuardOptions.keyExtractor.extract(context);

        const requestAllowed = await this.checkRate(key, finalGuardOptions);

        if (!requestAllowed) {
            await this.rejectWithError(context, key, finalGuardOptions);
        }

        return true;
    }

    private getMetadataOptions(context: ExecutionContext): RateLimitOptions {
        const handlerOptions: RateLimitOptions = this.reflector.get(RATE_LIMIT_METADATA, context.getHandler());

        if (handlerOptions && handlerOptions.bypass === "skip") {
            return handlerOptions;
        }

        const classOptions: RateLimitOptions = this.reflector.get(RATE_LIMIT_METADATA, context.getClass());

        return {
            ...(classOptions ?? {}),
            ...(handlerOptions ?? {})
        };
    }

    private async getFinalGuardOptions(context: ExecutionContext, metadataOptions: RateLimitOptions): Promise<RunOptions> {
        const contextId = this.getContextId(context);

        const dynamicOptions = await this.getDynamicOptions(context, metadataOptions, contextId);

        const keyExtractorToken = metadataOptions.keyExtractor ?? dynamicOptions.keyExtractor ?? this.options.keyExtractor;
        const errorFactoryToken = metadataOptions.errorFactory ?? dynamicOptions.errorFactory ?? this.options.errorFactory;

        const strategy = metadataOptions.strategy ?? dynamicOptions.strategy ?? this.options.strategy;
        const strategyOptions = {
            ...(dynamicOptions.options ?? {}),
            ...(metadataOptions.options ?? {})
        };

        return {
            bypass: metadataOptions.bypass ?? dynamicOptions.bypass,
            scope: metadataOptions.scope ?? dynamicOptions.scope ?? this.options.scope,
            keyExtractor: await this.providersResolver.getKeyExtractor(keyExtractorToken, contextId),
            errorFactory: await this.providersResolver.getErrorFactory(errorFactoryToken, contextId),
            strategy: strategy,
            strategyOptions: {
                ...this.options.strategyOptions,
                [strategy]: {
                    ...this.options.strategyOptions[strategy],
                    ...(strategyOptions ?? {})
                }
            }
        };
    }

    private async checkRate(key: unknown, options: RunOptions) {
        const finalKey = getKey(key, options.strategy, options.scope);

        const executor = this.providersResolver.getExecutor(options.strategy);

        return await executor.check(finalKey, options.strategyOptions[options.strategy]);
    }

    private async rejectWithError(context: ExecutionContext, key: Key | undefined, options: RunOptions) {
        const errorOptions: ErrorFactoryOptions = {
            key: key,
            scope: options.scope,
            strategy: options.strategy,
            strategyOptions: options.strategyOptions,
            forceReject: options.bypass === "reject"
        };

        const error = await options.errorFactory.getError(context, errorOptions);

        throw error;
    }

    private async getDynamicOptions(context: ExecutionContext, metadataOptions: RateLimitOptions, contextId?: ContextId): Promise<DynamicRateLimitOptions> {
        const optionsFactoryToken = metadataOptions.factory ?? this.options.factory;

        if (!optionsFactoryToken) {
            return {};
        }

        const optionsFactoryInstance = await this.providersResolver.getOptionsFactory(optionsFactoryToken, contextId);

        return await optionsFactoryInstance.getOptions(context);
    }

    private getContextId(context: ExecutionContext): ContextId {
        const contextType: string = context.getType();

        switch (contextType) {
            case "http": {
                const request = context.switchToHttp().getRequest();
                return ContextIdFactory.getByRequest(request);
            }
            case "ws": {
                const client = context.switchToWs();
                return ContextIdFactory.getByRequest(client);
            }
            case "rpc": {
                const rpcContext = context.switchToRpc();
                return ContextIdFactory.getByRequest(rpcContext);
            }
            case "graphql": {
                const args = context.getArgs();
                return ContextIdFactory.getByRequest(args[2]);
            }
            default: {
                const arg = context.getArgByIndex(0);
                return ContextIdFactory.getByRequest(arg);
            }
        }
    }
}
