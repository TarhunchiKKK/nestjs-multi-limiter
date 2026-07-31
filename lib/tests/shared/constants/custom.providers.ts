import { ErrorFactory, type IErrorFactory, type IKeyExtractor, type IOptionsFactory, KeyExtractor, OptionsFactory } from "../../../src";

@KeyExtractor()
export class CustomKeyExtractor implements IKeyExtractor {
    public extract() {
        return "custom-key";
    }
}

@ErrorFactory()
export class CustomErrorFactory implements IErrorFactory {
    public getError() {
        return new Error();
    }
}

@OptionsFactory()
export class CustomOptionsFactory implements IOptionsFactory {
    public getOptions() {
        return {};
    }
}
