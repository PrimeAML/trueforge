/** Display labels for connector auth types (catalog + details). */
export const AUTH_TYPE_LABELS: Record<string, string> = {
  dcr: 'OAuth',
  oauth: 'OAuth',
  header: 'API Key',
  none: 'No Auth',
};

/** Dynamic registration and a pre-registered client id both need a per-user Connect. */
export function connectorUsesUserOAuth(type: string): boolean {
  return type === 'dcr' || type === 'oauth';
}
