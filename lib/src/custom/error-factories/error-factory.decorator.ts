import { Injectable, type InjectableOptions } from "@nestjs/common";
import "reflect-metadata";

export const ERROR_FACTORY_METADATA = "__rate_limiter_error_factory__";

/**
 * Decorator that marks class as error factory provider.
 *
 * @param options Options that are similar to `@Injectable()` decorator options.
 *
 * @publicApi
 */
export function ErrorFactory(options?: InjectableOptions): ClassDecorator {
    return (target) => {
        Injectable(options)(target);

        Reflect.defineMetadata(ERROR_FACTORY_METADATA, true, target);
    };
}
