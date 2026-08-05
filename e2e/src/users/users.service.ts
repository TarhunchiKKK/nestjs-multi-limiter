import { Injectable } from "@nestjs/common";
import type { User } from "./types/users.types";
import { Users } from "./users.data";

@Injectable()
export class UsersService {
    private users = Users;

    public async create(user: User) {
        this.users.push(user);

        return await Promise.resolve(user);
    }

    public async findAll() {
        return await Promise.resolve(this.users);
    }

    public async findOne(id: string) {
        const user = this.users.find((user) => user.id === id);

        return await Promise.resolve(user);
    }
}
