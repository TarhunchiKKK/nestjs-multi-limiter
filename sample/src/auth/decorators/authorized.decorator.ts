import { createParamDecorator } from "@nestjs/common";

export const Authorized = createParamDecorator((_, context) => {
    return context.switchToHttp().getRequest()["user"]?.["id"];
});
