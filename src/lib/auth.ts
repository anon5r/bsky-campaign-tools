import { BrowserOAuthClient } from '@atproto/oauth-client-browser'

// Determine the origin dynamically for flexibility, though client-metadata.json is static in this setup.
// In a real app, you'd likely generate the metadata or have different files for envs.
const origin = typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:5173'

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
  handleResolver: 'https://bsky.social', // Default resolver
})
