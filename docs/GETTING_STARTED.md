# Sosh App — Getting Started, Local Dev & Deployment Guide

> **Stack**: React Native · Expo SDK 54 · Expo Router · NativeWind · Redux Toolkit · Firebase · `react-native-iap`  
> **Bundle ID**: `com.social.aiautomation`  
> **App name**: `Sosh` | **Expo slug**: `Sosh`

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [First-Time Setup](#2-first-time-setup)
3. [Environment Variables](#3-environment-variables)
4. [Running Locally (Development)](#4-running-locally-development)
5. [Building with EAS](#5-building-with-eas)
6. [Submitting to App Stores](#6-submitting-to-app-stores)
7. [Native Rebuilds](#7-native-rebuilds-when-required)
8. [Useful Scripts & Commands Reference](#8-useful-scripts--commands-reference)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites

Install the following tools **before** cloning the repo:

| Tool | Version | Install |
| :--- | :--- | :--- |
| Node.js | ≥ 20 LTS | [nodejs.org](https://nodejs.org) |
| npm | ≥ 10 (comes with Node) | — |
| Expo CLI | Latest | `npm install -g expo-cli` |
| EAS CLI | ≥ 5.0.0 | `npm install -g eas-cli` |
| Xcode | ≥ 16 (iOS builds) | Mac App Store |
| Android Studio | Latest (Android builds) | [developer.android.com](https://developer.android.com/studio) |
| CocoaPods | Latest | `sudo gem install cocoapods` |
| Watchman | Latest | `brew install watchman` |

> **macOS only**: iOS simulator and native iOS builds require a Mac with Xcode installed.

---

## 2. First-Time Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd Sosh-App

# 2. Install JS dependencies (patch-package runs automatically via postinstall)
npm install

# 3. Copy the environment template and fill in your values
cp .env.example .env
# → Edit .env with your API keys (see Section 3)

# 4. Log in to your Expo account (required for EAS builds)
eas login

# 5. (iOS only) Install CocoaPods native dependencies
cd ios && pod install && cd ..
```

> **Note**: The `/ios` and `/android` folders are git-ignored (generated). Run `npx expo prebuild` to regenerate them if they are missing (see [Section 7](#7-native-rebuilds-when-required)).

---

## 3. Environment Variables

Create a `.env` file in the project root. All variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app bundle.

```dotenv
# ── Backend API ───────────────────────────────────────────
EXPO_PUBLIC_API_BASE_URL=https://n8n-production-0558.up.railway.app/webhook

# ── Poppy AI ──────────────────────────────────────────────
EXPO_PUBLIC_POPPY_API_KEY=<your-poppy-api-key>
EXPO_PUBLIC_POPPY_API_URL=https://api.getpoppy.ai/api
EXPO_PUBLIC_POPPY_WEBHOOK_URL=https://n8n-production-0558.up.railway.app/webhook/poppyAi

# ── Anthropic (Claude) ────────────────────────────────────
EXPO_PUBLIC_ANTHROPIC_API_KEY=<your-anthropic-api-key>
EXPO_PUBLIC_ANTHROPIC_API_URL=https://api.anthropic.com/v1

# ── Firebase ──────────────────────────────────────────────
EXPO_PUBLIC_FIREBASE_API_KEY=<your-firebase-api-key>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=rapdxb-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=rapdxb-app
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=rapdxb-app.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=459898012419
EXPO_PUBLIC_FIREBASE_APP_ID=<your-firebase-app-id>
```

### Additional Native Config Files (not in `.env`)

These files must be placed manually in the project root — they are **git-ignored** for security:

| File | Platform | Source |
| :--- | :--- | :--- |
| `GoogleService-Info.plist` | iOS | Firebase Console → Project Settings → iOS app |
| `google-services.json` | Android | Firebase Console → Project Settings → Android app |

---

## 4. Running Locally (Development)

### Option A — Expo Go (fastest, limited native modules)

> ⚠️ Expo Go **does not support** `react-native-iap`, `@react-native-firebase/messaging`, or other native modules. Use this only for UI-only development.

```bash
npm start
# → Scan the QR code with the Expo Go app on your device
```

### Option B — Development Build (recommended)

A development build is a custom native binary that includes all native modules. You only need to rebuild when native dependencies change.

#### Run on iOS Simulator
```bash
npm run ios
# or explicitly:
npx expo run:ios
```

#### Run on Android Emulator / Device
```bash
npm run android
# or explicitly:
npx expo run:android
```

#### Run on a Physical iOS Device (requires dev build installed)
```bash
npx expo start --dev-client
# → Scan QR in the Expo Dev Client app
```

---

## 5. Building with EAS

EAS (Expo Application Services) handles cloud builds for all three profiles defined in `eas.json`.

### Build Profiles

| Profile | Purpose | Distribution | Notes |
| :--- | :--- | :--- | :--- |
| `development` | Local dev build with dev client | Internal (TestFlight/APK) | Enables fast refresh + JS debugger |
| `preview` | QA testing | Internal · iOS Simulator | iOS runs on simulator; Android produces APK |
| `production` | App Store / Play Store release | Store submission | Signed, optimized bundle |

### Build Commands

```bash
# ── Development build ─────────────────────────────────────
eas build --profile development --platform ios
eas build --profile development --platform android
eas build --profile development --platform all   # both at once

# ── Preview build (QA / internal testers) ────────────────
eas build --profile preview --platform ios
eas build --profile preview --platform android

# ── Production build ──────────────────────────────────────
eas build --profile production --platform ios
eas build --profile production --platform android
eas build --profile production --platform all
```

> Add `--local` to run the build on your machine instead of EAS cloud servers (requires all native toolchains installed locally).

### App Identifiers
| Platform | Bundle ID / Package |
| :--- | :--- |
| iOS | `com.social.aiautomation` |
| Android | `com.social.aiautomation` |

---

## 6. Submitting to App Stores

### iOS — App Store Connect

```bash
# Submit the latest successful production iOS build
eas submit --platform ios --latest

# Or submit a specific build by ID
eas submit --platform ios --id <build-id>
```

**Pre-submission checklist:**
- [ ] `buildNumber` in `app.json` is incremented (currently `"1"`)
- [ ] Production entitlements set to `"aps-environment": "production"` in `app.json`
- [ ] In-App Purchase products (`sosh.pro.monthly`, `sosh.enterprise.monthly`) are approved in App Store Connect
- [ ] `GoogleService-Info.plist` has `APS_ENVIRONMENT = production`
- [ ] App Privacy labels updated in App Store Connect (AI data sharing disclosure)
- [ ] All required screenshots uploaded in App Store Connect

### Android — Google Play

```bash
# Submit the latest successful production Android build
eas submit --platform android --latest

# Or submit a specific build
eas submit --platform android --id <build-id>
```

**Pre-submission checklist:**
- [ ] `versionCode` incremented in `app.json`
- [ ] `google-services.json` is present and up to date
- [ ] In-App Purchase products configured in Google Play Console
- [ ] Data safety form completed in Google Play Console

---

## 7. Native Rebuilds (When Required)

You **must** regenerate native folders and rebuild the dev binary when you:
- Add or remove a native dependency (e.g., a new `react-native-*` package)
- Change `app.json` plugins or permissions
- Upgrade the Expo SDK version

```bash
# Regenerate /ios and /android from app.json + package.json
npx expo prebuild --clean

# Then rebuild native iOS
cd ios && pod install && cd ..
npx expo run:ios

# Or rebuild via EAS
eas build --profile development --platform ios
```

> `--clean` deletes the existing `/ios` and `/android` folders before regenerating. Only use it when you intend to fully reset the native layer.

---

## 8. Useful Scripts & Commands Reference

### npm Scripts (from `package.json`)

| Command | Description |
| :--- | :--- |
| `npm start` | Start the Expo dev server (Metro bundler) |
| `npm run ios` | Run on iOS simulator via `expo run:ios` |
| `npm run android` | Run on Android emulator via `expo run:android` |
| `npm run web` | Start Expo web server (`expo start --web`) |
| `npm run lint` | Run ESLint via `expo lint` |
| `npm run reset-project` | Resets the project to a clean state (runs `scripts/reset-project.js`) |

### EAS Commands

```bash
# ── Auth ──────────────────────────────────────────────────
eas login                          # Log in to your Expo account
eas whoami                         # Check current login

# ── Build ─────────────────────────────────────────────────
eas build --platform ios           # iOS cloud build (production by default)
eas build --platform android       # Android cloud build
eas build --platform all           # Both platforms
eas build --profile <profile> --platform <platform>
eas build:list                     # List recent builds

# ── Submit ────────────────────────────────────────────────
eas submit --platform ios --latest
eas submit --platform android --latest

# ── Update (OTA) ──────────────────────────────────────────
eas update --branch production --message "Fix: subscription expiry"
eas update:list                    # List OTA updates

# ── Credentials ───────────────────────────────────────────
eas credentials                    # Manage signing keys & provisioning profiles
```

### Expo CLI Commands

```bash
# Start dev server with cache cleared
npx expo start --clear

# Prebuild native directories
npx expo prebuild
npx expo prebuild --clean          # Full reset

# Upgrade Expo SDK
npx expo install expo@latest
npx expo install --fix             # Fix dependency version mismatches

# Diagnose environment
npx expo doctor
```

### iOS-specific

```bash
# Install/update CocoaPods dependencies
cd ios && pod install && cd ..

# Force pod update (useful after SDK upgrades)
cd ios && pod install --repo-update && cd ..

# Open in Xcode
open ios/Sosh.xcworkspace
```

### Android-specific

```bash
# Clean Android build cache
cd android && ./gradlew clean && cd ..

# Run on connected device
npx expo run:android --device
```

---

## 9. Troubleshooting

### Metro bundler cache issues
```bash
npx expo start --clear
```

### CocoaPods version conflicts
```bash
cd ios
pod deintegrate
pod install --repo-update
cd ..
```

### `patch-package` patches not applied
```bash
npm run postinstall
# or
npx patch-package
```

### Firebase push notifications not working in dev
- Ensure `GoogleService-Info.plist` / `google-services.json` are present in the project root.
- FCM push does **not** work in Expo Go — use a development build.
- For iOS: check that `aps-environment` entitlement matches your distribution type (`development` vs `production`).

### IAP not working
- `react-native-iap` requires a **development build** — it will not function in Expo Go.
- Products must be configured and approved in App Store Connect / Google Play Console before they appear.
- On iOS simulator, use a Sandbox Apple ID (Settings → App Store → Sandbox Account).

### TypeScript errors after `npm install`
```bash
npx expo install --fix   # Aligns package versions to Expo SDK requirements
```

### Build fails on EAS — "missing credentials"
```bash
eas credentials          # Follow the interactive setup to generate/upload signing certs
```

### Android build: `SDK location not found`
Create `android/local.properties`:
```
sdk.dir=/Users/<your-username>/Library/Android/sdk
```
