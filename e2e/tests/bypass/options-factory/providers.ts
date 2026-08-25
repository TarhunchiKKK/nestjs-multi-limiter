import { type IOptionsFactory, OptionsFactory, type RateLimitOptions } from "nestjs-multi-limiter";

@OptionsFactory()
export class SkipOptionsFactory implements IOptionsFactory {
    public getOptions(): RateLimitOptions {
        return { bypass: "skip" };
    }
}

@OptionsFactory()
export class RejectOptionsFactory implements IOptionsFactory {
    public getOptions(): RateLimitOptions {
        return { bypass: "reject" };
    }
}
