import { Controller, Get, Inject, Param } from "@nestjs/common";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
    public constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

    @Get(":id")
    public async findOne(@Param("id") id: string) {
        return await this.usersService.findOne(id);
    }
}
