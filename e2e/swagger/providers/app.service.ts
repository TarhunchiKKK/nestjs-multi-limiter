import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
    public hello() {
        return { message: "hello" };
    }
}
