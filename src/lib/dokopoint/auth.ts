const TOKEN_URL = "https://auth.dokopoint.app/api/v2/oauth/token";

interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

export async function getDokopointToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.token;
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.DOKOPOINT_CLIENT_ID,
      client_secret: process.env.DOKOPOINT_CLIENT_SECRET,
      grant_type: "client_credentials",
      scope: "",
    }),
  });

  if (!res.ok) {
    throw new Error(`Dokopoint auth failed: ${res.status}`);
  }

  const data = await res.json();

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };

  return tokenCache.token;
}

export function invalidateToken() {
  tokenCache = null;
}
