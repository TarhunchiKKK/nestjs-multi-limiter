export type OmitFields<T, K extends keyof T> = Omit<T, K>;

export type ExtractMember<T, U extends T> = T extends U ? T : never;
