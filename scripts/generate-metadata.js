import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the public URL from environment variables or default to local development
const publicUrl = process.env.PUBLIC_URL || 'http://127.0.0.1:5173';

// Remove trailing slash if present
const origin = publicUrl.replace(/\/$/, '');

const metadata = {
  client_id: `${origin}/client-metadata.json`,
  client_name: "Bluesky Campaign Tools",
  client_uri: origin,
  redirect_uris: [`${origin}/`],
  scope: "atproto transition:generic",
  grant_types: ["authorization_code", "refresh_token"],
  response_types: ["code"],
  token_endpoint_auth_method: "none",
  application_type: "web",
  dpop_bound_access_tokens: true
};

const outputPath = path.resolve(__dirname, '../public/client-metadata.json');

fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));

console.log(`Generated public/client-metadata.json for origin: ${origin}`);
