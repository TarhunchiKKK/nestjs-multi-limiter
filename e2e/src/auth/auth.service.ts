import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { User } from "../users/types/users.types";

@Injectable()
export class AuthService {
    public constructor(@Inject(JwtService) private readonly jwtService: JwtService) {}

    public sign(payload: Pick<User, "id">) {
        return this.jwtService.sign({ id: payload.id });
    }

    public verify(token: string) {
        return this.jwtService.verify<Pick<User, "id">>(token);
    }
}
