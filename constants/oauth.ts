import Constants from "expo-constants";
import * as ReactNative from "react-native";
const bundleId = "com.app.veilroom";
const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `manus${timestamp}`;
const DEFAULT_API_BASE_URL = "https://3000-iyvmn2852n7gt7o52fqf2-ce30577e.us3.manus.computer";
const FALLBACK_API_BASE_URL = "https://veilroom-hfanevr6.manus.space";
const DEFAULT_OAUTH_PORTAL_URL = "https://manus.im";
const DEFAULT_OAUTH_SERVER_URL = "https://api.manus.im";
const DEFAULT_APP_ID = "HfaNeVR6dnwVqWNmeVeASt";
const env = { portal: process.env.EXPO_PUBLIC_OAUTH_PORTAL_URL || DEFAULT_OAUTH_PORTAL_URL, server: process.env.EXPO_PUBLIC_OAUTH_SERVER_URL || DEFAULT_OAUTH_SERVER_URL, appId: process.env.EXPO_PUBLIC_APP_ID || DEFAULT_APP_ID, ownerId: process.env.EXPO_PUBLIC_OWNER_OPEN_ID ?? "", ownerName: process.env.EXPO_PUBLIC_OWNER_NAME ?? "", apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL, deepLinkScheme: schemeFromBundleId };
export const OAUTH_PORTAL_URL = env.portal;
export const OAUTH_SERVER_URL = env.server;
export const APP_ID = env.appId;
export const OWNER_OPEN_ID = env.ownerId;
export const OWNER_NAME = env.ownerName;
export const API_BASE_URL = env.apiBaseUrl;
export function getApiFallbackBaseUrl(): string { return FALLBACK_API_BASE_URL; }
export function getApiBaseUrl(): string {
  if (API_BASE_URL) return API_BASE_URL.replace(/\/$/, "");
  if (ReactNative.Platform.OS === "web" && typeof window !== "undefined" && window.location) {
    const { protocol, hostname } = window.location;
    const apiHostname = hostname.replace(/^8081-/, "3000-");
    if (apiHostname !== hostname) return `${protocol}//${apiHostname}`;
  }
  return DEFAULT_API_BASE_URL;
}
export const SESSION_TOKEN_KEY = "app_session_token";
export const USER_INFO_KEY = "manus-runtime-user-info";
const encodeState = (value: string) => {
  if (typeof globalThis.btoa === "function") return globalThis.btoa(value);
  const BufferImpl = (globalThis as Record<string, any>).Buffer;
  if (BufferImpl) return BufferImpl.from(value, "utf-8").toString("base64");
  return value;
};
export const getRedirectUri = () => ReactNative.Platform.OS === "web" ? `${getApiBaseUrl()}/api/oauth/callback` : `${env.deepLinkScheme}://oauth/callback`;
export const getLoginUrl = () => {
  const redirectUri = getRedirectUri();
  const state = encodeState(redirectUri);
  const url = new URL(`${OAUTH_PORTAL_URL}/app-auth`);
  url.searchParams.set("appId", APP_ID); url.searchParams.set("redirectUri", redirectUri); url.searchParams.set("state", state); url.searchParams.set("type", "signIn");
  return url.toString();
};
export async function startOAuthLogin(): Promise<string | null> {
  if (ReactNative.Platform.OS !== "web" && Constants.appOwnership === "expo") throw new Error("Google ile giriş Expo Go’da desteklenmez. Lütfen uygulamayı Android development veya production build olarak açın.");
  const loginUrl = getLoginUrl();
  if (ReactNative.Platform.OS === "web") { if (typeof window !== "undefined") window.location.href = loginUrl; return null; }
  const supported = await ReactNative.Linking.canOpenURL(loginUrl);
  if (!supported) { console.warn("[OAuth] Cannot open login URL: URL scheme not supported"); return null; }
  try { await ReactNative.Linking.openURL(loginUrl); } catch (error) { console.error("[OAuth] Failed to open login URL:", error); }
  return null;
}
