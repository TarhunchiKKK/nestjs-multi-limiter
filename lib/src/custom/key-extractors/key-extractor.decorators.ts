import { Injectable, type InjectableOptions } from "@nestjs/common";
import "reflect-metadata";

export const KEY_EXTRACTOR_METADATA = "__rate_limiter_key_extractor__";

/**
 * Decorator that marks class as custom key extractor.
 * 
 * @param options Options that are similar to `@Injectable()` decorator options. 
 * 
 * @publicApi
 */
export function KeyExtractor(options?: InjectableOptions): ClassDecorator {
    return (target) => {
        Injectable(options)(target);

        Reflect.defineMetadata(KEY_EXTRACTOR_METADATA, true, target);
    };
}
