import { mock } from "bun:test";
import type { IErrorFactory, IKeyExtractor, IOptionsFactory } from "../../../src";
import type { IExecutor } from "../../../src/executors";
import type { ProvidersDiscoveryService } from "../../../src/services/providers-discovery.service";

export function createProvidersDiscoveryServiceMock() {
    return {
        getExecutor: mock<ProvidersDiscoveryService["getExecutor"]>(() => ({}) as IExecutor<unknown>),
        getKeyExtractor: mock<ProvidersDiscoveryService["getKeyExtractor"]>(() => ({}) as IKeyExtractor),
        getErrorFactory: mock<ProvidersDiscoveryService["getErrorFactory"]>(() => ({}) as IErrorFactory),
        getOptionsFactory: mock<ProvidersDiscoveryService["getOptionsFactory"]>(() => ({}) as IOptionsFactory)
    };
}
