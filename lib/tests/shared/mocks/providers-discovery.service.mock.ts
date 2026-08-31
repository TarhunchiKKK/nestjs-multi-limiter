import { mock } from "bun:test";
import type { IErrorFactory, IKeyExtractor, IOptionsFactory } from "../../../src";
import type { IExecutor } from "../../../src/executors";
import type { ProvidersResolver } from "../../../src/services/providers.resolver";

export function createProvidersResolverMock() {
    return {
        getExecutor: mock<ProvidersResolver["getExecutor"]>(() => ({}) as IExecutor<unknown>),
        getKeyExtractor: mock<ProvidersResolver["getKeyExtractor"]>(() => Promise.resolve({} as IKeyExtractor)),
        getErrorFactory: mock<ProvidersResolver["getErrorFactory"]>(() => Promise.resolve({} as IErrorFactory)),
        getOptionsFactory: mock<ProvidersResolver["getOptionsFactory"]>(() => Promise.resolve({} as IOptionsFactory))
    };
}
