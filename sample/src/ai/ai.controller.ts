import { Body, Controller, Param, Post } from "@nestjs/common";
import { Authorization } from "../auth/decorators/authorization.decorator";
import type { AiService } from "./ai.service";
import type { GenerateImageDto } from "./dto/generate-image.dto";
import type { GenerateTextDto } from "./dto/generate-text.dto";

@Controller("ai")
@Authorization()
export class AiController {
    public constructor(private readonly aiService: AiService) {}

    @Post(":chatId/text")
    public async generateText(@Param("chatId") chatId: string, @Body() dto: GenerateTextDto) {
        return await this.aiService.generateText(chatId, dto);
    }

    @Post(":chatId/image")
    public async generateImage(@Param("chatId") chatId: string, @Body() dto: GenerateImageDto) {
        return await this.aiService.generateImage(chatId, dto);
    }
}
