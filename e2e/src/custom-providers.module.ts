import { Module } from "@nestjs/common";
import { DefaultProvidersController } from "./controllers/default-providers.controller";
import { OverrideProvidersController } from "./controllers/override-providers.controller";
import { SkippingController } from "./controllers/skipping.controller";
import { IoRedisAdapter } from "./providers/redis.adapter";
import { UsersModule } from "./users/users.module";

@Module({
    imports: [UsersModule],
    controllers: [DefaultProvidersController, OverrideProvidersController, SkippingController],
    providers: [IoRedisAdapter]
})
export class CustomProvidersModule {}
