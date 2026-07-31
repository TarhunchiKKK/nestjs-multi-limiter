import { mock } from "bun:test";

export function createProvidersDiscoveryServiceMock() {
    return {
        getExecutor: mock(() => {}),
        getKeyExtractor: mock(() => {}),
        getErrorFactory: mock(() => {}),
        getOptionsFactory: mock(() => {})
    };
}
