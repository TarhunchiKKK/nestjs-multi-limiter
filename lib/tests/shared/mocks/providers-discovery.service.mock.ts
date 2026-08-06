import { mock } from "bun:test";
import type { IErrorFactory, IKeyExtractor, IOptionsFactory } from "../../../src";
import type { IExecutor } from "../../../src/executors";
import type { ProvidersResolver } from "../../../src/services/providers.resolver";

export function createProvidersDiscoveryServiceMock() {
    return {
        getExecutor: mock<ProvidersResolver["getExecutor"]>(() => ({}) as IExecutor<unknown>),
        getKeyExtractor: mock<ProvidersResolver["getKeyExtractor"]>(() => ({}) as IKeyExtractor),
        getErrorFactory: mock<ProvidersResolver["getErrorFactory"]>(() => ({}) as IErrorFactory),
        getOptionsFactory: mock<ProvidersResolver["getOptionsFactory"]>(() => ({}) as IOptionsFactory)
    };
}
