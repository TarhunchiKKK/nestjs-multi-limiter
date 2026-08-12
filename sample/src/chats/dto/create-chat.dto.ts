import { IsNotEmpty, IsString } from "class-validator";

export class CreateChatDto {
    @IsNotEmpty({ message: "Chat title should not be empty" })
    @IsString({ message: "Chat title should be string" })
    public title: string;
}
