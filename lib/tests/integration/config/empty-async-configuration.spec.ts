import { describe, expect, it } from "bun:test";
import { Test } from "@nestjs/testing";
import { RateLimiterModule } from "../../../src";
import { InvalidAsyncConfigurationError } from "../../../src/shared/errors";

describe("Empty async configuration", () => {
    it("should throw valid error", async () => {
        const createModule = async () => {
            return await Test.createTestingModule({
                imports: [RateLimiterModule.forRootAsync({})]
            }).compile();
        };

        expect(createModule()).rejects.toThrow(InvalidAsyncConfigurationError);
    });
});
