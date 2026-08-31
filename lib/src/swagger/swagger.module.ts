import { HttpStatus, type INestApplication } from "@nestjs/common";
import { ModulesContainer, Reflector } from "@nestjs/core";
import type { RateLimiterModuleFullOptions } from "../config";
import { RATE_LIMIT_METADATA, type RateLimitOptions } from "../decorators";
import { MODULE_OPTIONS_TOKEN } from "../di";
import { RateLimiterModuleSwaggerError } from "./rate-limiter-module-swagger.error";
import type { ApiResponseOptions } from "@nestjs/swagger";
import { RateLimiterSwaggerConfig, RateLimiterSwaggerFullConfig } from "./types";

export class RateLimiterSwaggerModule {
    public static patch(app: INestApplication, config: RateLimiterSwaggerConfig = {}) {
        try {
            require("@nestjs/swagger");
        } catch (_: unknown) {
            console.warn('No "@nestjs/swagger" package found. Skip swagger documentation patching.');
            return;
        }

        const { modules, reflector, moduleOptions } = RateLimiterSwaggerModule.getAppProviders(app);
        const fullConfig = {
            ...config,
            app: app
        };

        modules.forEach((module) => {
            module.controllers.forEach((wrapper) => {
                if (!wrapper.instance || !Object.getPrototypeOf(wrapper.instance)) {
                    return;
                }

                const prototype = Object.getPrototypeOf(wrapper.instance);
                const controllerOptions = reflector.get<RateLimitOptions>(RATE_LIMIT_METADATA, prototype.constructor) ?? {};
                const methodNames = Object.getOwnPropertyNames(prototype).filter((item) => typeof prototype[item] === "function" && item !== "constructor");

                methodNames.forEach((methodName) => {
                    const method = prototype[methodName];

                    const methodOptions = reflector.get<RateLimitOptions>(RATE_LIMIT_METADATA, method);

                    if (methodOptions) {
                        const finalOptions = RateLimiterSwaggerModule.mergeRateLimitOptions(moduleOptions, controllerOptions, methodOptions);

                        RateLimiterSwaggerModule.appendSwaggerMetadata(method, finalOptions, fullConfig);
                    }
                });
            });
        });
    }

    // biome-ignore lint/suspicious/noExplicitAny: `any` type is returned by `reflector`
    private static appendSwaggerMetadata(method: any, options: RateLimitOptions, config: RateLimiterSwaggerFullConfig) {
        const { DECORATORS } = require("@nestjs/swagger/dist/constants");

        const apiResponseMetadata: Record<string, ApiResponseOptions> = Reflect.getMetadata(DECORATORS.API_RESPONSE, method) ?? {};

        if (config?.transform) {
            apiResponseMetadata[HttpStatus.TOO_MANY_REQUESTS.toString()] = config.transform(config.app, options);
        } else {
            apiResponseMetadata[HttpStatus.TOO_MANY_REQUESTS.toString()] = {
                description: `Route is protected by "${options.strategy}" algorithm`
            };
        }

        Reflect.defineMetadata(DECORATORS.API_RESPONSE, apiResponseMetadata, method);
    }

    private static mergeRateLimitOptions(
        moduleOptions: RateLimiterModuleFullOptions,
        controllerOptions?: RateLimitOptions,
        methodOptions?: RateLimitOptions
    ): RateLimitOptions {
        const strategy = methodOptions?.strategy ?? controllerOptions?.strategy ?? moduleOptions.strategy;

        return {
            scope: methodOptions?.scope ?? controllerOptions?.scope ?? moduleOptions.scope,
            keyExtractor: methodOptions?.keyExtractor ?? controllerOptions?.keyExtractor ?? moduleOptions.defaultProviders.keyExtractor,
            errorFactory: methodOptions?.errorFactory ?? controllerOptions?.errorFactory ?? moduleOptions.defaultProviders.errorFactory,
            factory: methodOptions?.factory ?? controllerOptions?.factory ?? moduleOptions.defaultProviders.optionsFactory,
            bypass: methodOptions?.bypass ?? controllerOptions?.bypass,
            strategy: strategy,
            options: {
                ...moduleOptions.strategyOptions[strategy],
                ...(controllerOptions?.options || {}),
                ...(methodOptions?.options || {})
            }
        };
    }

    private static getAppProviders(app: INestApplication) {
        const modulesContainer = app.get(ModulesContainer);

        if (!modulesContainer) {
            throw new RateLimiterModuleSwaggerError('"ModulesContainer" not found in provided app.');
        }

        const reflector = app.get(Reflector);

        if (!reflector) {
            throw new RateLimiterModuleSwaggerError('"Reflector" not found in provided app.');
        }

        const moduleOptions: RateLimiterModuleFullOptions = app.get(MODULE_OPTIONS_TOKEN);

        if (!moduleOptions) {
            throw new RateLimiterModuleSwaggerError('"RateLimiterModuleOptions" not found in provided app.');
        }

        return {
            moduleOptions,
            reflector,
            modules: [...modulesContainer.values()]
        };
    }
}
