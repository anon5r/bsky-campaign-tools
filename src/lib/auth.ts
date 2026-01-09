import { BrowserOAuthClient } from '@atproto/oauth-client-browser'

// For local development, we must match the client-metadata.json exactly.
// If we are in production, we might want to use window.location.origin, 
// but we need to ensure the deployed client-metadata.json matches that origin.
// To support both, we can check the hostname.

const isLocal = typeof window !== 'undefined' && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
const origin = isLocal ? 'http://127.0.0.1:5173' : (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:5173')

export const client = new BrowserOAuthClient({
  clientMetadata: {
    client_id: `${origin}/client-metadata.json`,
    client_name: 'Bluesky Campaign Tools',
    client_uri: origin,
    redirect_uris: [`${origin}/`],
    scope: 'atproto transition:generic',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
    application_type: 'web',
    dpop_bound_access_tokens: true,
  },
  handleResolver: 'https://bsky.social',
})