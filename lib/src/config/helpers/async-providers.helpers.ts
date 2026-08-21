import type { Provider } from "@nestjs/common";
import { MODULE_OPTIONS_TOKEN } from "../../di";
import { InvalidAsyncConfigurationError } from "../../shared/errors";
import { mergeDefaultOptions } from "../defaults";
import type { IRateLimiterModuleOptionsFactory, RateLimiterModuleAsyncOptions, RateLimiterModuleFullOptions } from "../options";
import { validateModuleOptions } from "./validate-module-options.helper";

export function createAsyncModuleOptionsProvider(options: RateLimiterModuleAsyncOptions): Provider<RateLimiterModuleFullOptions> {
    if (!(options.useFactory || options.useClass || options.useExisting)) {
        throw new InvalidAsyncConfigurationError();
    }

    if (options.useFactory) {
        return {
            provide: MODULE_OPTIONS_TOKEN,
            inject: options.inject ?? [],
            // biome-ignore lint/suspicious/noExplicitAny: `any` type is necessary for factory customization
            useFactory: async (...args: any[]) => {
                // biome-ignore lint/style/noNonNullAssertion: `useFactory` field will be defined
                const calculatedOptions = await options.useFactory!(...args);

                const fullOptions = mergeDefaultOptions(calculatedOptions);

                validateModuleOptions(fullOptions);

                return fullOptions;
            }
        };
    }

    return {
        provide: MODULE_OPTIONS_TOKEN,
        // biome-ignore lint/style/noNonNullAssertion: One of this fields will be provided
        inject: [(options.useClass ?? options.useExisting)!],
        useFactory: async (optionsFactory: IRateLimiterModuleOptionsFactory) => {
            const calculatedOptions = await optionsFactory.createRateLimiterModuleOptions();

            const fullOptions = mergeDefaultOptions(calculatedOptions);

            validateModuleOptions(fullOptions);

            return fullOptions;
        }
    };
}
