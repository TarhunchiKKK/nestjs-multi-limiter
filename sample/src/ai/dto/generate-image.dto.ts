import { IsNotEmpty, IsString } from "class-validator";

export class GenerateImageDto {
    @IsNotEmpty({ message: "Text should not be empty" })
    @IsString({ message: "Text should be string" })
    public text: string;
}
