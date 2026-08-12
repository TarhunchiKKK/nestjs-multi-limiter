import { Body, Controller, Patch, Post, ValidationPipe } from "@nestjs/common";
import type { AuthService } from "./auth.service";
import { Authorization } from "./decorators/authorization.decorator";
import { Authorized } from "./decorators/authorized.decorator";
import type { SignInDto } from "./dto/sign-in.dto";
import type { SignUpDto } from "./dto/sign-up.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";

@Controller("auth")
export class AuthController {
    public constructor(private readonly authService: AuthService) {}

    @Post("sign-up")
    public async signUp(@Body() dto: SignUpDto) {
        return await this.authService.signUp(dto);
    }

    @Post("sign-in")
    public async signIn(@Body() dto: SignInDto) {
        return await this.authService.signIn(dto);
    }

    @Patch()
    @Authorization()
    public async update(@Authorized() userId: string, @Body(ValidationPipe) dto: UpdateUserDto) {
        return await this.authService.update(userId, dto);
    }
}
