import { Module } from "@nestjs/common";
import { DefaultProvidersController } from "./controllers/default-providers.controller";
import { OverrideProvidersController } from "./controllers/override-providers.controller";
import { SkippingController } from "./controllers/skipping.controller";
import { MoviesModule } from "./movies/movies.module";
import { RedisModule } from "./redis/redis.module";
import { UsersModule } from "./users/users.module";

@Module({
    imports: [UsersModule, MoviesModule, RedisModule],
    controllers: [DefaultProvidersController, OverrideProvidersController, SkippingController]
})
export class CustomProvidersModule {}
