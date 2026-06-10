import { getDokopointToken, invalidateToken } from "./auth";

const BASE_URL = "https://api.dokopoint.app/api/v2";

export async function dokopointRequest<T = unknown>(
  method: "GET" | "POST" | "PUT" | "PATCH",
  path: string,
  body?: object,
  params?: Record<string, string>
): Promise<T> {
  const token = await getDokopointToken();

  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(process.env.DOKOPOINT_WORKSPACE_UUID
        ? { "X-Dp-Workspace": process.env.DOKOPOINT_WORKSPACE_UUID }
        : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Token expired — retry once with fresh token
  if (res.status === 401) {
    invalidateToken();
    const freshToken = await getDokopointToken();
    const retry = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${freshToken}`,
        "Content-Type": "application/json",
        ...(process.env.DOKOPOINT_WORKSPACE_UUID
          ? { "X-Dp-Workspace": process.env.DOKOPOINT_WORKSPACE_UUID }
          : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!retry.ok) throw new Error(`Dokopoint error: ${retry.status}`);
    return retry.json() as Promise<T>;
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Dokopoint ${method} ${path} failed (${res.status}): ${errText}`);
  }

  return res.json() as Promise<T>;
}
