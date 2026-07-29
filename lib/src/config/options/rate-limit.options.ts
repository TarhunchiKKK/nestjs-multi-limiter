import type { Type } from "@nestjs/common";
import type { IErrorFactory } from "../../custom/error-factories";
import type { IKeyExtractor } from "../../custom/key-extractors";
import type { IOptionsFactory } from "../../custom/options-factories";
import type { StrategyOptionsUnion } from "../../executors";
import type { DeepPartial, PartialUnionMembers, TokenType } from "../../shared/lib";
import type { Scope } from "../../shared/model";
import type { StrategyOptions } from "./common.options";

/**
 * Options for `RateLimit` decorator.
 *
 * @publicApi
 */
export type RateLimitOptions = {
    /**
     * Overrides default scope.
     */
    scope?: Scope;

    /**
     * Overrides default key extractor.
     */
    keyExtractor?: Type<IKeyExtractor> | TokenType;

    /**
     * Overrides default error factory.
     */
    errorFactory?: Type<IErrorFactory> | TokenType;

    /**
     * Overrides default options factory
     */
    factory?: Type<IOptionsFactory> | TokenType;
} & PartialUnionMembers<StrategyOptionsUnion>;

export type RateLimitNormalizedOptions = Pick<RateLimitOptions, "scope" | "keyExtractor" | "errorFactory" | "factory"> & DeepPartial<StrategyOptions>;
