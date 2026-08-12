import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";
import type { Subscription } from "../types/subscription.type";

export class UpdateUserDto {
    @IsOptional()
    @IsNotEmpty({ message: "Username should not be empty" })
    @IsString({ message: "Username should be string" })
    public username?: string;

    @IsOptional()
    @IsNotEmpty({ message: "Subscription should not be empty" })
    @IsIn(["free", "pro", "enterprise"] satisfies Subscription[], { message: "Incorrect subscription (available values: free, pro, enterprise)" })
    public subscription?: Subscription;
}
