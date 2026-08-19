export class RateLimiterModuleConfigurationError extends Error {
    public constructor(errors: string[]) {
        const message = `\n[RateLimiterModule] Configuration Validation Failed:\n${errors.map((err) => `  - ${err}`).join("\n")}`;

        super(message);
    }
}
