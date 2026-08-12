import { faker } from "@faker-js/faker";
import { Inject, Injectable } from "@nestjs/common";
import { MessagesService } from "../messages/messages.service";
import type { GenerateImageDto } from "./dto/generate-image.dto";
import type { GenerateTextDto } from "./dto/generate-text.dto";

@Injectable()
export class AiService {
    public constructor(@Inject(MessagesService) private readonly messagesService: MessagesService) {}

    public async generateText(chatId: string, dto: GenerateTextDto) {
        await this.messagesService.create(chatId, {
            text: dto.text,
            sender: "user"
        });

        const text = faker.lorem.paragraphs();

        return await this.messagesService.create(chatId, {
            text: text,
            sender: "ai"
        });
    }

    public async generateImage(chatId: string, dto: GenerateImageDto) {
        await this.messagesService.create(chatId, {
            text: dto.text,
            sender: "user"
        });

        const image = faker.image.url();

        return await this.messagesService.create(chatId, {
            image: image,
            sender: "ai"
        });
    }
}
