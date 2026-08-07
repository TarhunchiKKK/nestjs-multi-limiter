import { Inject } from "@nestjs/common";

export const STORAGE_TOKEN = "storage_token";

export const GUARD_OPTIONS_TOKEN = Symbol();

export const MODULE_OPTIONS_TOKEN = Symbol();

export function InjectStorage() {
    return Inject(STORAGE_TOKEN);
}
