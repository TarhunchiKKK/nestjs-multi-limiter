import { type INestApplication } from "@nestjs/common";
import { ModulesContainer, Reflector } from "@nestjs/core";
import { RATE_LIMIT_METADATA, type RateLimitOptions } from "../decorators";

export class RateLimiterSwaggerModule {
    public static patch(app: INestApplication) {
        try {
            require("@nestjs/swagger");
        } catch (_: unknown) {
            console.warn('No "@nestjs/swagger" package found. Skip swagger documentation patching.');
            return;
        }

        const modulesContainer = app.get(ModulesContainer);
        const reflector = app.get(Reflector);

        const modules = [...modulesContainer.values()];

        modules.forEach((module) => {
            module.controllers.forEach(({ instance }) => {
                if (!instance || !Object.getPrototypeOf(instance)) {
                    return;
                }

                const prototype = Object.getPrototypeOf(instance);
                const methodNames = Object.getOwnPropertyNames(prototype).filter((item) => typeof prototype[item] === "function" && item !== "constructor");

                methodNames.forEach((methodName) => {
                    const targetCallback = prototype[methodName];

                    const options = reflector.get<RateLimitOptions>(RATE_LIMIT_METADATA, targetCallback);

                    if (options) {
                        RateLimiterSwaggerModule.appendSwaggerMetadata(methodName, options);
                    }
                });
            });
        });
    }

    private static appendSwaggerMetadata(methodName: string, options: RateLimitOptions) {
        console.log(methodName, options);
    }
}
