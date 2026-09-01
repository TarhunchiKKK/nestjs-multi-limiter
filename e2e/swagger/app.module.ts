import { Module } from "@nestjs/common";
import { RateLimiterModule } from "nestjs-multi-limiter";
import { AppController } from "./controllers/app.controller";
import { BypassController } from "./controllers/bypass.controller";
import { CustomProvidersController } from "./controllers/custom-providers.controller";
import { IgnoredController } from "./controllers/ignored.controller";
import { IgnoredMethodController } from "./controllers/ignored-method.controller";
import { NonMarkedController } from "./controllers/non-marked.controller";
import { AppService } from "./providers/app.service";
import { CustomErrorFactory } from "./providers/custom.error-factory";
import { CustomKeyExtractor } from "./providers/custom.key-extractor";
import { CustomOptionsFactory } from "./providers/custom.options-factory";

@Module({
    imports: [
        RateLimiterModule.forRoot({
            storage: {
                type: "in-memory"
            }
        })
    ],
    controllers: [AppController, BypassController, CustomProvidersController, IgnoredMethodController, IgnoredController, NonMarkedController],
    providers: [AppService, CustomKeyExtractor, CustomErrorFactory, CustomOptionsFactory]
})
export class AppModule {}
