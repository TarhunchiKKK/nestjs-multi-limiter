import { Controller, Get, Inject, Param, Post } from "@nestjs/common";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
    public constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

    @Get()
    public async findAll() {
        return await this.usersService.findAll();
    }

    @Post("sign-in/:index")
    public signIn(@Param("index") index: string) {
        return this.usersService.singIn(+index);
    }
}
