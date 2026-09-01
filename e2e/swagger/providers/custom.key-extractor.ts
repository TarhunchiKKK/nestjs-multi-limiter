import { type IKeyExtractor, KeyExtractor } from "nestjs-multi-limiter";

@KeyExtractor()
export class CustomKeyExtractor implements IKeyExtractor {
    public extract() {
        return "key";
    }
}
