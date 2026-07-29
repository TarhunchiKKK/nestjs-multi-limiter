import { Injectable, type InjectableOptions } from "@nestjs/common";
import "reflect-metadata";

export const OPTIONS_FACTORY_METADATA = "__rate_limiter_options_factory__";

/**
 * Decorator that marks class as dynamic options factory provider.
 *
 * @param options Options that are similar to `@Injectable()` decorator options.
 *
 * @publicApi
 */
export function OptionsFactory(options?: InjectableOptions): ClassDecorator {
    return (target) => {
        Injectable(options)(target);

        Reflect.defineMetadata(OPTIONS_FACTORY_METADATA, true, target);
    };
}
