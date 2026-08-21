export class InvalidAsyncConfigurationError extends Error {
    public constructor() {
        super("Invalid async configuration for RateLimiterModule. Must provide useFactory, useClass or useExisting.");
    }
}
