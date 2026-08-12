import { Body, Controller, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { RateLimit, RateLimitGuard } from "nestjs-multi-limiter";
import { Authorization } from "../auth/decorators/authorization.decorator";
import type { AiService } from "./ai.service";
import type { GenerateImageDto } from "./dto/generate-image.dto";
import type { GenerateTextDto } from "./dto/generate-text.dto";
import { ImageGenerationOptionsFactory } from "./rate-limit/image-generation.options.factory";
import { TextGenerationOptionsFactory } from "./rate-limit/text-generation.options-factory";

// 📌 This controller use custom options factory
@Controller("ai")
@Authorization()
@UseGuards(RateLimitGuard)
export class AiController {
    public constructor(private readonly aiService: AiService) {}

    @Post(":chatId/text")
    @RateLimit({ scope: "text-generation", factory: TextGenerationOptionsFactory })
    public async generateText(@Param("chatId") chatId: string, @Body(ValidationPipe) dto: GenerateTextDto) {
        return await this.aiService.generateText(chatId, dto);
    }

    @Post(":chatId/image")
    @RateLimit({ scope: "image-generation", factory: ImageGenerationOptionsFactory })
    public async generateImage(@Param("chatId") chatId: string, @Body(ValidationPipe) dto: GenerateImageDto) {
        return await this.aiService.generateImage(chatId, dto);
    }
}
