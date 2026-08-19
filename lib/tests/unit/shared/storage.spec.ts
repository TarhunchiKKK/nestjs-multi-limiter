import { describe, expect, it } from "bun:test";
import { IncorrectLuaScriptResultError } from "../../../src/shared/errors";
import { castLuaScriptResult } from "../../../src/shared/model";

describe("castLuaScriptResult", () => {
    it("should return true", () => {
        const result = castLuaScriptResult(1);

        expect(result).toBeTrue();
    });

    it("should return false", () => {
        const result = castLuaScriptResult(0);

        expect(result).toBeFalse();
    });

    it("should throw error (incorrect number)", () => {
        expect(() => castLuaScriptResult(123)).toThrow(IncorrectLuaScriptResultError);
    });

    it("should throw error (incorrect param type)", () => {
        expect(() => castLuaScriptResult("string-result")).toThrow(IncorrectLuaScriptResultError);
    });
});
