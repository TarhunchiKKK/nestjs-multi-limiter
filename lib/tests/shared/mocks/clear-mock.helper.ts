/** biome-ignore-all lint/suspicious/noExplicitAny: `any` type is necessary for complex mocks (mocked and constant fields) */
export function clearMock(mock: Record<string, any>) {
    for (const key in mock) {
        mock[key]?.mockClear?.();
    }
}
