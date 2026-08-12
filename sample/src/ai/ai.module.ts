import { Module } from "@nestjs/common";
import { MessagesModule } from "../messages/messages.module";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { ImageGenerationOptionsFactory } from "./rate-limit/image-generation.options.factory";
import { TextGenerationOptionsFactory } from "./rate-limit/text-generation.options-factory";

@Module({
    imports: [MessagesModule],
    controllers: [AiController],
    providers: [AiService, TextGenerationOptionsFactory, ImageGenerationOptionsFactory]
})
export class AiModule {}
