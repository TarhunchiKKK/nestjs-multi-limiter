import { createParamDecorator } from "@nestjs/common";
import { getIdFromRequest } from "../helpers/get-id-from-request.helper";

export const Authorized = createParamDecorator((_, context) => {
    return getIdFromRequest(context);
});
