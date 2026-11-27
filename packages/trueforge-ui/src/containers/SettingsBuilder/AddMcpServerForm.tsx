'use client';

import { useEffect, useState, type FormEvent } from 'react';

import { auiInputClass } from '../../atoms/lib/inputClasses.js';
import { Button } from '../../atoms/primitives/Button.js';
import { CenteredModal } from '../../atoms/primitives/CenteredModal.js';
import { Icon } from '../../icons/Icon.js';
import type { ConnectorAuth, ConnectorAuthType, ConnectorBase } from '../../server/types.js';

export type McpAuthType = ConnectorAuthType;

export type AddMcpServerDraft = {
  name: string;
  url: string;
  description: string;
  auth: ConnectorAuth;
};

type AddMcpServerFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (draft: AddMcpServerDraft) => void | Promise<void>;
  connector?: ConnectorBase;
  busy?: boolean;
  error?: string | null;
};

const AUTH_OPTIONS: Array<{ value: 'none' | 'header' | 'dcr'; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'header', label: 'API Key' },
  { value: 'dcr', label: 'OAuth' },
];

/** Stored pre-registered clients are still OAuth. The form shows them on the OAuth option. */
function formAuthType(type: ConnectorAuthType | undefined): 'none' | 'header' | 'dcr' {
  if (type === 'header' || type === 'none') {
    return type;
  }
  return 'dcr';
}

const inputClassName = auiInputClass('h-11 shadow-sm');

const RequiredMark = () => (
  <span className="ml-0.5 text-failure-bg" aria-hidden>
    *
  </span>
);

const AddMcpServerForm = ({ open, onOpenChange, onSubmit, connector, busy = false, error }: AddMcpServerFormProps) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [authType, setAuthType] = useState<'none' | 'header' | 'dcr'>('dcr');
  const [apiKey, setApiKey] = useState('');
  const [headerName, setHeaderName] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [scopes, setScopes] = useState('');
  const [registration, setRegistration] = useState<'dcr' | 'client'>('dcr');
  const [copied, setCopied] = useState(false);
  const isEditing = connector !== undefined;
  const nameInputClassName = auiInputClass(
    `h-11 shadow-sm ${isEditing ? 'cursor-not-allowed bg-secondary-bg/60 text-text-secondary opacity-40' : ''}`,
  );

  const resetForm = () => {
    setName('');
    setUrl('');
    setDescription('');
    setAuthType('dcr');
    setApiKey('');
    setHeaderName('');
    setClientId('');
    setClientSecret('');
    setScopes('');
    setRegistration('dcr');
    setCopied(false);
  };

  useEffect(() => {
    if (!open) return;
    setName(connector?.name ?? '');
    setUrl(connector?.url ?? '');
    setDescription(connector?.description ?? '');
    setAuthType(formAuthType(connector?.auth.type));
    setApiKey('');
    setHeaderName(connector?.auth.type === 'header' ? (connector.auth.headerName ?? '') : '');
    setClientId(connector?.auth.type === 'oauth' ? (connector.auth.clientId ?? '') : '');
    setClientSecret('');
    setScopes(connector?.auth.type === 'oauth' ? (connector.auth.scopes ?? '') : '');
    setRegistration(connector?.auth.type === 'oauth' ? 'client' : 'dcr');
    setCopied(false);
  }, [connector, open]);

  const callbackUrl =
    typeof window === 'undefined' ? '' : `${window.location.origin}/api/v1/mcp-servers/oauth/callback`;

  const copyCallbackUrl = async () => {
    if (callbackUrl === '') {
      return;
    }
    try {
      await navigator.clipboard.writeText(callbackUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const hasApiKey = !!apiKey.trim() || connector?.auth.type === 'header';
  const isValid =
    !!name.trim() &&
    !!description.trim() &&
    !!url.trim() &&
    (authType !== 'header' || hasApiKey) &&
    (authType !== 'dcr' || registration !== 'client' || !!clientId.trim());

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || busy) return;

    const auth: ConnectorAuth =
      authType === 'header'
        ? {
            type: 'header',
            apiKey: apiKey.trim(),
            ...(headerName.trim() ? { headerName: headerName.trim() } : {}),
          }
        : authType === 'dcr' && registration === 'client'
          ? {
              type: 'oauth',
              clientId: clientId.trim(),
              ...(clientSecret.trim() ? { clientSecret: clientSecret.trim() } : {}),
              ...(scopes.trim() ? { scopes: scopes.trim() } : {}),
            }
          : { type: authType };

    try {
      await onSubmit({
        name: name.trim(),
        url: url.trim(),
        description: description.trim(),
        auth,
      });
      resetForm();
      onOpenChange(false);
    } catch {
      // Parent surfaces error; keep form open.
    }
  };

  return (
    <CenteredModal
      open={open}
      onOpenChange={handleOpenChange}
      title={isEditing ? 'Edit MCP server' : 'Add MCP server'}
      description={
        isEditing
          ? 'Update how this connector authenticates.'
          : 'Point at a remote MCP endpoint. It then behaves like any other connector.'
      }
      contentSized
      headerIcon={
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary-bg text-text-primary"
          aria-hidden
        >
          <Icon name="mcp-server" className="size-6" />
        </span>
      }
    >
      <form className="flex flex-col overflow-y-auto p-5 md:p-6" onSubmit={e => void handleSubmit(e)}>
        <div className="space-y-4">
          <div>
            <label htmlFor="mcp-server-name" className="mb-1.5 block text-sm font-medium text-text-primary">
              Name
              <RequiredMark />
            </label>
            <input
              id="mcp-server-name"
              type="text"
              required
              value={name}
              readOnly={isEditing}
              aria-disabled={isEditing}
              onChange={event => {
                setName(event.target.value);
              }}
              placeholder="analytics-postgres-mcp"
              autoFocus={!isEditing}
              className={nameInputClassName}
            />
          </div>

          <div>
            <label htmlFor="mcp-server-description" className="mb-1.5 block text-sm font-medium text-text-primary">
              Description
              <RequiredMark />
            </label>
            <textarea
              id="mcp-server-description"
              value={description}
              onChange={event => {
                setDescription(event.target.value);
              }}
              placeholder="Query analytics from Postgres"
              required
              rows={3}
              className={auiInputClass('resize-y py-2.5 shadow-sm')}
            />
          </div>

          <div>
            <label htmlFor="mcp-server-url" className="mb-1.5 block text-sm font-medium text-text-primary">
              URL
              <RequiredMark />
            </label>
            <input
              id="mcp-server-url"
              type="url"
              required
              value={url}
              onChange={event => {
                setUrl(event.target.value);
              }}
              placeholder="https://mcp.example.com/mcp"
              className={inputClassName}
            />
          </div>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-text-primary">
              Auth type
              <RequiredMark />
            </legend>
            <div className="flex w-full flex-row rounded-md border border-border bg-secondary-bg/40 p-1">
              {AUTH_OPTIONS.map(option => (
                <label
                  key={option.value}
                  className={`flex h-8 flex-1 cursor-pointer items-center justify-center rounded-sm text-sm font-medium transition-colors ${
                    authType === option.value
                      ? 'bg-dropdown-selected-item-bg text-dropdown-selected-item-text shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <input
                    type="radio"
                    name="mcp-auth-type"
                    value={option.value}
                    checked={authType === option.value}
                    onChange={() => {
                      setAuthType(option.value);
                    }}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          {authType === 'dcr' ? (
            <>
              <div>
                <label htmlFor="mcp-registration-method" className="mb-1.5 block text-sm font-medium text-text-primary">
                  Registration method
                </label>
                <select
                  id="mcp-registration-method"
                  value={registration}
                  className={auiInputClass('h-11 cursor-pointer shadow-sm')}
                  onChange={event => {
                    setRegistration(event.target.value === 'client' ? 'client' : 'dcr');
                  }}
                >
                  <option value="dcr">Dynamic Client Registration</option>
                  <option value="client">User-Defined OAuth Client</option>
                </select>
                <p className="mt-1.5 text-xs text-text-secondary">
                  {registration === 'dcr'
                    ? 'TrueForge registers an OAuth client when you save. The authorization server must allow dynamic registration.'
                    : 'Use a client that already exists on the authorization server. Each person still signs in.'}
                </p>
              </div>

              {registration === 'client' ? (
                <>
                  <div>
                    <label htmlFor="mcp-callback-url" className="mb-1.5 block text-sm font-medium text-text-primary">
                      Callback URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="mcp-callback-url"
                        type="text"
                        readOnly
                        value={callbackUrl}
                        className={auiInputClass('h-11 cursor-text shadow-sm')}
                      />
                      <Button.Secondary
                        type="button"
                        className="h-11 shrink-0 px-3"
                        aria-label="Copy callback URL"
                        onClick={() => {
                          void copyCallbackUrl();
                        }}
                      >
                        <Icon name="copy" className="size-4" />
                        <span className="sr-only">{copied ? 'Copied' : 'Copy'}</span>
                      </Button.Secondary>
                    </div>
                    <p className="mt-1.5 text-xs text-text-secondary">
                      {copied ? 'Copied.' : 'Add this redirect on the OAuth client.'}
                    </p>
                  </div>
                  <div>
                    <label htmlFor="mcp-server-client-id" className="mb-1.5 block text-sm font-medium text-text-primary">
                      OAuth client ID
                      <RequiredMark />
                    </label>
                    <input
                      id="mcp-server-client-id"
                      type="text"
                      required
                      value={clientId}
                      onChange={event => {
                        setClientId(event.target.value);
                      }}
                      placeholder="OAuth client ID"
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="mcp-server-client-secret"
                      className="mb-1.5 block text-sm font-medium text-text-primary"
                    >
                      OAuth client secret <span className="font-normal text-text-secondary">(optional)</span>
                    </label>
                    <input
                      id="mcp-server-client-secret"
                      type="password"
                      value={clientSecret}
                      onChange={event => {
                        setClientSecret(event.target.value);
                      }}
                      placeholder={
                        connector?.auth.type === 'oauth' && connector.auth.hasClientSecret
                          ? 'Leave blank to keep the current secret'
                          : 'OAuth client secret (optional)'
                      }
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label htmlFor="mcp-server-scopes" className="mb-1.5 block text-sm font-medium text-text-primary">
                      Scopes <span className="font-normal text-text-secondary">(optional)</span>
                    </label>
                    <input
                      id="mcp-server-scopes"
                      type="text"
                      value={scopes}
                      onChange={event => {
                        setScopes(event.target.value);
                      }}
                      placeholder="openid profile email"
                      className={inputClassName}
                    />
                  </div>
                </>
              ) : null}
            </>
          ) : null}

          {authType === 'header' ? (
            <>
              <div>
                <label htmlFor="mcp-server-api-key" className="mb-1.5 block text-sm font-medium text-text-primary">
                  API key
                  {connector?.auth.type === 'header' ? (
                    <span className="font-normal text-text-secondary"> (leave blank to keep current)</span>
                  ) : (
                    <RequiredMark />
                  )}
                </label>
                <input
                  id="mcp-server-api-key"
                  type="password"
                  required={connector?.auth.type !== 'header'}
                  value={apiKey}
                  onChange={event => {
                    setApiKey(event.target.value);
                  }}
                  placeholder="Bearer <Paste the token from the provider>"
                  aria-describedby="mcp-server-api-key-hint"
                  className={inputClassName}
                />
                <p id="mcp-server-api-key-hint" className="mt-1.5 text-xs text-text-secondary">
                  {`This is the value for the "${headerName.trim() || 'Authorization'}" header.`}
                </p>
              </div>

              <div>
                <label htmlFor="mcp-server-header-name" className="mb-1.5 block text-sm font-medium text-text-primary">
                  Header name <span className="font-normal text-text-secondary">(optional)</span>
                </label>
                <input
                  id="mcp-server-header-name"
                  type="text"
                  value={headerName}
                  onChange={event => {
                    setHeaderName(event.target.value);
                  }}
                  placeholder="Authorization"
                  className={inputClassName}
                />
              </div>
            </>
          ) : null}
        </div>

        <div className="mt-6 space-y-3">
          {error ? <p className="text-failure-bg text-sm">{error}</p> : null}
          <Button.Primary type="submit" size="large" disabled={!isValid || busy} className="w-full shrink-0">
            {isEditing ? 'Save' : 'Add'}
          </Button.Primary>
        </div>
      </form>
    </CenteredModal>
  );
};

export default AddMcpServerForm;
