import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatsController } from "./chats.controller";
import { ChatsService } from "./chats.service";
import { Chat } from "./entities/chat.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Chat])],
    controllers: [ChatsController],
    providers: [ChatsService]
})
export class ChatsModule {}
