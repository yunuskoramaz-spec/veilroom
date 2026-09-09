import { Platform } from "react-native";
import { getApiBaseUrl, getApiFallbackBaseUrl } from "@/constants/oauth";
import * as Auth from "./auth";
const TRANSIENT_NETWORK_RETRY_DELAY_MS = 1_200;
function isTransientNetworkError(error: unknown): boolean { return error instanceof TypeError && /network request failed|failed to fetch/i.test(error.message); }
async function fetchWithApiFailover(url: string, init?: RequestInit): Promise<Response> { try { return await fetch(url, init); } catch (error) { if (!isTransientNetworkError(error)) throw error; await new Promise((resolve) => setTimeout(resolve, TRANSIENT_NETWORK_RETRY_DELAY_MS)); const primary = getApiBaseUrl(); const fallback = getApiFallbackBaseUrl(); const retryUrl = url.startsWith(primary) && primary !== fallback ? `${fallback}${url.slice(primary.length)}` : url; return fetch(retryUrl, init); } }
export async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
 const headers: Record<string,string> = { "Content-Type":"application/json", ...((options.headers as Record<string,string>) || {}) };
 if (Platform.OS !== "web") { const token = await Auth.getSessionToken(); if (token) headers.Authorization = `Bearer ${token}`; }
 const baseUrl=getApiBaseUrl(); const url=baseUrl ? `${baseUrl.replace(/\/$/,"")}${endpoint.startsWith("/")?endpoint:`/${endpoint}`}` : endpoint;
 const response=await fetchWithApiFailover(url,{...options,headers,credentials:"include"});
 const contentType=response.headers.get("content-type") || "";
 const body=await response.text();
 if (!response.ok) { let message=`API call failed: ${response.status} ${response.statusText}`; if (contentType.includes("application/json")) { try { const j=JSON.parse(body); message=j.error||j.message||message; } catch {} } else if (body) message=`API returned non-JSON response (${response.status})`; throw new Error(message); }
 if (!body) return {} as T;
 if (!contentType.includes("application/json")) throw new Error("API returned an unexpected non-JSON response.");
 try { return JSON.parse(body) as T; } catch { throw new Error("API returned invalid JSON."); }
}
export async function exchangeOAuthCode(code:string,state:string):Promise<{sessionToken:string;user:any}> { const params=new URLSearchParams({code,state}); const result=await apiCall<{app_session_id:string;user:any}>(`/api/oauth/mobile?${params.toString()}`); return {sessionToken:result.app_session_id,user:result.user}; }
export async function logout():Promise<void>{ await apiCall<void>("/api/auth/logout",{method:"POST"}); }
export async function getMe():Promise<{id:number;openId:string;username?:string|null;name:string|null;email:string|null;role?:"user"|"admin";loginMethod:string|null;lastSignedIn:string}|null>{try{const result=await apiCall<{user:any}>("/api/auth/me");return result.user||null;}catch{return null;}}
export async function establishSession(token:string):Promise<boolean>{try{const base=getApiBaseUrl();const response=await fetchWithApiFailover(`${base}/api/auth/session`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},credentials:"include"});return response.ok;}catch{return false;}}
