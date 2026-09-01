import { type DynamicRateLimitOptions, type IOptionsFactory, OptionsFactory } from "nestjs-multi-limiter";

@OptionsFactory()
export class CustomOptionsFactory implements IOptionsFactory {
    public getOptions(): DynamicRateLimitOptions {
        return {
            strategy: "leaky-bucket",
            options: {
                capacity: 20,
                leakRate: 1 / 1_000
            }
        };
    }
}
