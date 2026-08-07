import { ErrorFactory, type IErrorFactory, type IKeyExtractor, type IOptionsFactory, KeyExtractor, OptionsFactory } from "../../../src";

@KeyExtractor()
export class CustomKeyExtractor implements IKeyExtractor {
    public extract() {
        return "custom-key";
    }
}

export class CustomError extends Error {
    public constructor() {
        super("Custom rate limit error");
    }
}

@ErrorFactory()
export class CustomErrorFactory implements IErrorFactory {
    public getError() {
        return new CustomError();
    }
}

@OptionsFactory()
export class CustomOptionsFactory implements IOptionsFactory {
    public getOptions() {
        return {};
    }
}
