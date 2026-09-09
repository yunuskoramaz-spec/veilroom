// Load environment variables with proper priority (system > .env)
import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";

const rawBundleId = "com.app.veilroom";
const bundleId = rawBundleId.replace(/[-_]/g, ".").replace(/[^a-zA-Z0-9.]/g, "").replace(/\.+/g, ".").replace(/^\.+|\.+$/g, "").toLowerCase().split(".").map((segment) => /^[a-zA-Z]/.test(segment) ? segment : "x" + segment).join(".") || "space.manus.app";
const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `manus${timestamp}`;
const env = { appName: "Veilroom", appSlug: "veilroom", logoUrl: "/manus-storage/veilroom-icon_9e5d0055.png", scheme: schemeFromBundleId, iosBundleId: bundleId, androidPackage: bundleId };
const config: ExpoConfig = {
  name: env.appName, slug: env.appSlug, version: "1.0.0", orientation: "portrait", icon: "./assets/images/icon.png", scheme: env.scheme, userInterfaceStyle: "automatic", newArchEnabled: true,
  ios: { supportsTablet: true, bundleIdentifier: env.iosBundleId, infoPlist: { ITSAppUsesNonExemptEncryption: false } },
  android: { adaptiveIcon: { backgroundColor: "#E6F4FE", foregroundImage: "./assets/images/android-icon-foreground.png", backgroundImage: "./assets/images/android-icon-background.png", monochromeImage: "./assets/images/android-icon-monochrome.png" }, edgeToEdgeEnabled: true, predictiveBackGestureEnabled: false, package: env.androidPackage, googleServicesFile: "./google-services.json", permissions: ["POST_NOTIFICATIONS", "CAMERA", "RECORD_AUDIO"], intentFilters: [{ action: "VIEW", autoVerify: true, data: [{ scheme: env.scheme, host: "*" }], category: ["BROWSABLE", "DEFAULT"] }] },
  web: { bundler: "metro", output: "static", favicon: "./assets/images/favicon.png" },
  plugins: ["expo-router", ["expo-audio", { microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone." }], ["expo-image-picker", { photosPermission: "Allow $(PRODUCT_NAME) to choose media for encrypted room attachments.", cameraPermission: "Allow $(PRODUCT_NAME) to capture encrypted room attachments." }], ["expo-camera", { cameraPermission: "Allow $(PRODUCT_NAME) to scan private room invitations.", microphonePermission: "Allow $(PRODUCT_NAME) to record protected voice notes." }], "expo-document-picker", "expo-notifications", ["expo-video", { supportsBackgroundPlayback: true, supportsPictureInPicture: true }], ["expo-splash-screen", { image: "./assets/images/splash-icon.png", imageWidth: 200, resizeMode: "contain", backgroundColor: "#ffffff", dark: { backgroundColor: "#000000" } }], ["expo-build-properties", { android: { buildArchs: ["armeabi-v7a", "arm64-v8a"], minSdkVersion: 24 } }]],
  extra: { eas: { projectId: "9a869014-4070-4f52-8f7b-e7d15de85261" } }, experiments: { typedRoutes: true, reactCompiler: true }
};
export default config;
