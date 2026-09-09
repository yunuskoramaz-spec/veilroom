import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/server/routers";
import { getApiBaseUrl, getApiFallbackBaseUrl } from "@/constants/oauth";
import * as Auth from "@/lib/_core/auth";

export const trpc = createTRPCReact<AppRouter>();
const TRANSIENT_NETWORK_RETRY_DELAY_MS = 1_200;
function isTransientNetworkError(error: unknown): boolean { return error instanceof TypeError && /network request failed|failed to fetch/i.test(error.message); }
async function fetchWithTransientRetry(input: RequestInfo | URL, init?: RequestInit) {
  try { return await fetch(input, init); } catch (error) {
    if (!isTransientNetworkError(error)) throw error;
    await new Promise((resolve) => setTimeout(resolve, TRANSIENT_NETWORK_RETRY_DELAY_MS));
    const primaryBaseUrl = getApiBaseUrl(); const fallbackBaseUrl = getApiFallbackBaseUrl();
    const requestUrl = typeof input === "string" || input instanceof URL ? input.toString() : "";
    const retryInput = requestUrl.startsWith(primaryBaseUrl) && primaryBaseUrl !== fallbackBaseUrl ? `${fallbackBaseUrl}${requestUrl.slice(primaryBaseUrl.length)}` : input;
    return fetch(retryInput, init);
  }
}
export function createTRPCClient() {
  return trpc.createClient({ links: [httpBatchLink({ url: `${getApiBaseUrl()}/api/trpc`, transformer: superjson, async headers() { const token = await Auth.getSessionToken(); return token ? { Authorization: `Bearer ${token}` } : {}; }, fetch(url, options) { return fetchWithTransientRetry(url, { ...options, credentials: "include" }); } })] });
}
