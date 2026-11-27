// Hand-extended beside the Fern-generated auth union so a pre-registered client id can be saved.

export interface McpServerOAuthClientAuth {
    type: "oauth";
    client_id: string;
    client_secret?: string;
    scopes?: string;
}
