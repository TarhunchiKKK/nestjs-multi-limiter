import { Body, Controller, Post } from "@nestjs/common";
import type { AuthService } from "./auth.service";
import type { SignInDto } from "./dto/sign-in.dto";
import type { SignUpDto } from "./dto/sign-up.dto";

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
}
