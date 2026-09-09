import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { SESSION_TOKEN_KEY, USER_INFO_KEY } from "@/constants/oauth";
export type User = { id: number; openId: string; username?: string | null; name: string | null; email: string | null; role?: "user" | "admin"; loginMethod: string | null; lastSignedIn: Date };
export async function getSessionToken(): Promise<string | null> { try { if (Platform.OS === "web") return null; return await SecureStore.getItemAsync(SESSION_TOKEN_KEY); } catch { return null; } }
export async function setSessionToken(token: string): Promise<void> { if (Platform.OS === "web") return; await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token); }
export async function removeSessionToken(): Promise<void> { try { if (Platform.OS !== "web") await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY); } catch {} }
export async function getUserInfo(): Promise<User | null> { try { const info = Platform.OS === "web" ? window.localStorage.getItem(USER_INFO_KEY) : await SecureStore.getItemAsync(USER_INFO_KEY); return info ? JSON.parse(info) : null; } catch { return null; } }
export async function setUserInfo(user: User): Promise<void> { if (Platform.OS === "web") window.localStorage.setItem(USER_INFO_KEY, JSON.stringify(user)); else await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(user)); }
export async function clearUserInfo(): Promise<void> { try { if (Platform.OS === "web") window.localStorage.removeItem(USER_INFO_KEY); else await SecureStore.deleteItemAsync(USER_INFO_KEY); } catch {} }
