import type { ExecutionContext } from "@nestjs/common";
import { type IKeyExtractor, KeyExtractor } from "nestjs-multi-limiter";
import { getIdFromRequest } from "../helpers/get-id-from-request.helper";

@KeyExtractor()
export class JwtKeyExtractor implements IKeyExtractor {
    public extract(context: ExecutionContext) {
        return getIdFromRequest(context);
    }
}
