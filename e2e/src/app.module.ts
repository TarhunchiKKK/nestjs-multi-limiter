import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { CustomErrorFactory } from "./providers/custom.error-factory";
import { CustomKeyExtractor } from "./providers/custom.key-extractor";
import { CustomOptionsFactory } from "./providers/custom.options-factory";

@Module({
    imports: [],
    controllers: [AppController],
    providers: [CustomKeyExtractor, CustomErrorFactory, CustomOptionsFactory]
})
export class AppModule {}
