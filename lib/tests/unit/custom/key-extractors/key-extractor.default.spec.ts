import { beforeEach, describe, expect } from "bun:test";
import { it } from "node:test";
import { type ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { BuiltinKeyExtractor } from "../../../../src/custom/key-extractors";

describe("BuiltinKeyExtractor", () => {
    let keyExtractor: BuiltinKeyExtractor;
    const key = "request-ip";

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [BuiltinKeyExtractor]
        }).compile();

        keyExtractor = module.get(BuiltinKeyExtractor);
    });

    describe("success", () => {
        it("should return request ip", () => {
            const context = {
                getType: () => "http",
                switchToHttp: () => ({
                    getRequest: () => ({
                        ip: key
                    })
                })
            };

            const result = keyExtractor.extract(context as unknown as ExecutionContext);

            expect(result).toBe(key);
        });

        it('should return ip from "x-forwarded-for" header array', () => {
            const context = {
                getType: () => "http",
                switchToHttp: () => ({
                    getRequest: () => ({
                        headers: {
                            "x-forwarded-for": [key, "header"]
                        }
                    })
                })
            };

            const result = keyExtractor.extract(context as unknown as ExecutionContext);

            expect(result).toBe(key);
        });

        it('should return ip from "x-forwarded-for" header string', () => {
            const context = {
                getType: () => "http",
                switchToHttp: () => ({
                    getRequest: () => ({
                        headers: {
                            "x-forwarded-for": key
                        }
                    })
                })
            };

            const result = keyExtractor.extract(context as unknown as ExecutionContext);

            expect(result).toBe(key);
        });
    });

    describe("fail", () => {
        it("should receive incorrect context type", () => {
            const context = {
                getType: () => "rpc"
            };

            expect(() => {
                keyExtractor.extract(context as unknown as ExecutionContext);
            }).toThrow(InternalServerErrorException);
        });

        it("should not successfully extract request", () => {
            const context = {
                getType: () => "http",
                switchToHttp: () => ({
                    getRequest: () => null
                })
            };

            expect(() => {
                keyExtractor.extract(context as unknown as ExecutionContext);
            }).toThrow(InternalServerErrorException);
        });

        it('should not successfully extract key from empty "x-forwarded-for" header array', () => {
            const context = {
                getType: () => "http",
                switchToHttp: () => ({
                    getRequest: () => ({
                        headers: {
                            "x-forwarded-for": []
                        }
                    })
                })
            };

            expect(() => {
                keyExtractor.extract(context as unknown as ExecutionContext);
            }).toThrow(InternalServerErrorException);
        });
    });
});
