import type { MessageSender } from "../types/message-sender.type";

export class CreateMessageDto {
    public text?: string;

    public image?: string;

    public sender: MessageSender;
}
