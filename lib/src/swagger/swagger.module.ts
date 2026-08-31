import { HttpStatus } from "@nestjs/common";
import { ModulesContainer, Reflector } from "@nestjs/core";
import type { Module } from "@nestjs/core/internal";
import type { ApiResponseOptions } from "@nestjs/swagger";
import type { RateLimiterModuleFullOptions } from "../config";
import { RATE_LIMIT_METADATA, type RateLimitOptions } from "../decorators";
import { MODULE_OPTIONS_TOKEN } from "../di";
import type { Strategies } from "../shared/model";
import { RateLimiterModuleSwaggerError } from "./rate-limiter-module-swagger.error";
import type { FilteredRoute, NestApplicationLike, RateLimiterSwaggerConfig, RateLimitSwaggerOptions } from "./types";

export class RateLimiterSwaggerModule {
    public static patch(app: NestApplicationLike, config: RateLimiterSwaggerConfig = {}) {
        try {
            require("@nestjs/swagger");
        } catch (_: unknown) {
            console.warn('[RateLimiterModule]: No "@nestjs/swagger" package found. Skip swagger documentation patching.');
            return;
        }

        const { modules, reflector, moduleOptions } = RateLimiterSwaggerModule.getAppProviders(app);

        const filteredRoutes = RateLimiterSwaggerModule.filterRoutes(modules, config);

        filteredRoutes.forEach(({ controller, methods }) => {
            const prototype = Object.getPrototypeOf(controller.instance);
            const controllerOptions = reflector.get<RateLimitOptions>(RATE_LIMIT_METADATA, prototype.constructor);

            methods.forEach((methodName) => {
                const method = prototype[methodName];
                const methodOptions = reflector.get<RateLimitOptions>(RATE_LIMIT_METADATA, method);

                if (config.explicitOnly && !(controllerOptions || methodOptions)) {
                    return;
                }

                const finalOptions = RateLimiterSwaggerModule.mergeRateLimitOptions(moduleOptions, controllerOptions, methodOptions);
                RateLimiterSwaggerModule.appendSwaggerMetadata(method, finalOptions, config);
            });
        });
    }

    private static getAppProviders(app: NestApplicationLike) {
        const modulesContainer = app.get<ModulesContainer>(ModulesContainer);

        if (!modulesContainer) {
            throw new RateLimiterModuleSwaggerError('"ModulesContainer" not found in provided app.');
        }

        const reflector = app.get<Reflector>(Reflector);

        if (!reflector) {
            throw new RateLimiterModuleSwaggerError('"Reflector" not found in provided app.');
        }

        const moduleOptions = app.get<RateLimiterModuleFullOptions>(MODULE_OPTIONS_TOKEN);

        if (!moduleOptions) {
            throw new RateLimiterModuleSwaggerError('"RateLimiterModuleOptions" not found in provided app.');
        }

        return {
            moduleOptions,
            reflector,
            modules: [...modulesContainer.values()]
        };
    }

    private static filterRoutes(modules: Module[], config: RateLimiterSwaggerConfig) {
        const results: FilteredRoute[] = [];

        modules.forEach((module) => {
            module.controllers.forEach((wrapper) => {
                if (!wrapper.instance || !Object.getPrototypeOf(wrapper.instance)) {
                    return;
                }

                const controllerName = wrapper.metatype?.name as string;

                if (config.excludeRoutes?.includes(controllerName)) {
                    return;
                }

                const prototype = Object.getPrototypeOf(wrapper.instance);
                const methodNames = Object.getOwnPropertyNames(prototype).filter((item) => typeof prototype[item] === "function" && item !== "constructor");

                const route: FilteredRoute = {
                    controller: wrapper,
                    methods: []
                };

                methodNames.forEach((methodName) => {
                    if (config.excludeRoutes?.includes(`${controllerName}.${methodName}`)) {
                        return;
                    }

                    route.methods.push(methodName);
                });

                results.push(route);
            });
        });

        return results;
    }

    private static mergeRateLimitOptions(
        moduleOptions: RateLimiterModuleFullOptions,
        controllerOptions: RateLimitOptions = {},
        methodOptions: RateLimitOptions = {}
    ): RateLimitSwaggerOptions {
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

    // biome-ignore lint/suspicious/noExplicitAny: `any` type is returned by `reflector`
    private static appendSwaggerMetadata(method: any, options: RateLimitSwaggerOptions, config: RateLimiterSwaggerConfig) {
        const { DECORATORS } = require("@nestjs/swagger/dist/constants");

        const apiResponseMetadata: Record<string, ApiResponseOptions> = Reflect.getMetadata(DECORATORS.API_RESPONSE, method) ?? {};

        if (config?.transform) {
            apiResponseMetadata[HttpStatus.TOO_MANY_REQUESTS.toString()] = config.transform(options);
        } else {
            apiResponseMetadata[HttpStatus.TOO_MANY_REQUESTS.toString()] = RateLimiterSwaggerModule.getDefaultApiResponseOptions(options);
        }

        Reflect.defineMetadata(DECORATORS.API_RESPONSE, apiResponseMetadata, method);
    }

    private static getDefaultApiResponseOptions(options: RateLimitSwaggerOptions): ApiResponseOptions {
        if (options.factory) {
            return {
                description: "Rate limiting for this route is computed dynamically"
            };
        } else if (options.bypass === "skip") {
            return {
                description: "Rate limiting for this route is skipped"
            };
        } else if (options.bypass === "reject") {
            return {
                description: "Rate limiting for this route is forcibly rejected"
            };
        }

        switch (options.strategy) {
            case "fixed-window":
                return {
                    description: `This route is rate limited (scope=${options.scope}) with "${options.strategy}" algorithm (limit=${options.options.limit}, ttl=${options.options.ttl} ms)`
                };
            case "sliding-window-counter":
            case "sliding-window-log": {
                return {
                    description: `This route is rate limited (scope=${options.scope}) with "${options.strategy}" algorithm (limit=${options.options.limit}, windowMs=${options.options.windowMs} ms)`
                };
            }
            case "token-bucket": {
                return {
                    description: `This route is rate limited (scope=${options.scope}) with "${options.strategy}" algorithm (capacity=${options.options.capacity}, refillRate=${options.options.refillRate} tokens/ms)`
                };
            }
            case "leaky-bucket": {
                return {
                    description: `This route is rate limited (scope=${options.scope}) with "${options.strategy}" algorithm (capacity=${options.options.capacity}, leakRate=${options.options.leakRate} tokens/ms)`
                };
            }
            default: {
                console.warn(`[RateLimiterModule]: Unknown rate limiting strategy: ${(options as { strategy: Strategies }).strategy}`);
                return {
                    description: `Unknown rate limiting strategy: ${(options as { strategy: Strategies }).strategy}`
                };
            }
        }
    }
}
