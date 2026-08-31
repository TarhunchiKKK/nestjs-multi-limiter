export class RateLimiterSwaggerModule {
    public static patch() {
        try {
            require("@nestjs/swagger");
        } catch (_: unknown) {
            console.warn('No "@nestjs/swagger" package found. Skip swagger documentation patching.');
            return;
        }
    }
}
