/** biome-ignore-all lint/suspicious/noExplicitAny: `any` type is necessary for valid type mappings */
export type ExtractMember<T, U extends T> = T extends U ? T : never;

export type DeepPartial<T> = {
    [Key in keyof T]?: T[Key] extends object ? DeepPartial<Partial<T[Key]>> : Partial<T[Key]>;
};

export type PartialUnionMembers<T> = T extends any ? Partial<T> : never;
