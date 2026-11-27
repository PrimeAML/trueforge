// Hand-extended public auth variant for a pre-registered OAuth client.

import type * as TrueForge from "../../api/index.js";
import * as core from "../../core/index.js";
import type * as serializers from "../index.js";

export const McpServerAuthPublicTwo: core.serialization.ObjectSchema<
    serializers.McpServerAuthPublicTwo.Raw,
    TrueForge.McpServerAuthPublicTwo
> = core.serialization.object({
    type: core.serialization.stringLiteral("oauth"),
});

export declare namespace McpServerAuthPublicTwo {
    export interface Raw {
        type: "oauth";
    }
}
