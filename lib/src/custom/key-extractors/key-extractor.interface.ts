import type { ExecutionContext } from "@nestjs/common";
import type { Key } from "../../shared/model";

/**
 * Interface for custom key extractors.
 *
 * @publicApi
 */
export interface IKeyExtractor {
    /**
     * @param context Execution context of current request.
     * @returns Custom rate limiting data key.
     */
    extract: (context: ExecutionContext) => Key | Promise<Key>;
}
