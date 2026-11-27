// Hand-extended beside the Fern-generated auth union so a pre-registered client id can be saved.

import type * as TrueForge from "../../api/index.js";
import * as core from "../../core/index.js";
import type * as serializers from "../index.js";

export const McpServerOAuthClientAuth: core.serialization.ObjectSchema<
    serializers.McpServerOAuthClientAuth.Raw,
    TrueForge.McpServerOAuthClientAuth
> = core.serialization.object({
    type: core.serialization.stringLiteral("oauth"),
    client_id: core.serialization.string(),
    client_secret: core.serialization.string().optional(),
    scopes: core.serialization.string().optional(),
});

export declare namespace McpServerOAuthClientAuth {
    export interface Raw {
        type: "oauth";
        client_id: string;
        client_secret?: string | null;
        scopes?: string | null;
    }
}
