# 🛡️ Application Security Report

This report outlines critical security vulnerabilities currently present in the Sosh React Native application, demonstrates how an attacker would exploit them, and provides actionable recommendations to secure the app.

> [!CAUTION]
> The vulnerabilities identified below can lead to account takeover, data leaks, and massive financial liability due to stolen API keys. 

---

## 1. Vulnerability: Insecure Storage of Authentication Tokens

### Description
The application currently uses `@react-native-async-storage/async-storage` (in `services/storage.ts`) to store highly sensitive data, including the `user_token`. `AsyncStorage` writes data as plain text to the device's file system without any encryption. 

### 🔓 The Security Break (How Attackers Exploit This)
If a device is compromised, rooted/jailbroken, or even just connected via USB with USB debugging enabled, an attacker can extract the app's local database.

**Attacker Script to extract token via ADB (Android):**
```bash
# Attacker pulls the app's local storage database
adb root
adb shell "run-as com.sosh.app cat /data/data/com.sosh.app/databases/RKStorage" > extracted_storage.db

# Attacker searches for the plain text token
strings extracted_storage.db | grep "user_token"
```

Once the `user_token` is retrieved, the attacker can insert this token into their own client or script and make fully authenticated requests as the victim, achieving a complete Account Takeover (ATO).

### ✅ Recommended Solution: Secure Storage
**Options for Implementation:**
Migrate all sensitive data (Tokens, User Emails) from `AsyncStorage` to the device's hardware-backed Keychain/Keystore using `expo-secure-store`.

```typescript
// Replace AsyncStorage with SecureStore
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = "user_token";

// Save Token Securely
export const setToken = async (token: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

// Retrieve Token Securely
export const getToken = async () => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};
```

---

## 2. Vulnerability: Exposed 3rd-Party API Keys in Frontend Bundle

### Description
The application loads private API keys directly into the client-side code using `EXPO_PUBLIC_` environment variables. Specifically, we are injecting `EXPO_PUBLIC_ANTHROPIC_API_KEY` and `EXPO_PUBLIC_POPPY_API_KEY` directly into the JavaScript bundle (e.g. `services/api/anthropic.ts`). 

> [!WARNING]
> Anything prefixed with `EXPO_PUBLIC_` is **not a secret**. It is permanently hardcoded into the compiled `.js` bundle that gets shipped to the App Store/Play Store.

### 🔓 The Security Break (How Attackers Exploit This)
An attacker does not even need to intercept network traffic to steal the API keys. They just need to download the `.apk` or `.ipa` file from the app store and unpack it.

**Attacker Methodology:**
```bash
# 1. Attacker unzips the APK file
unzip sosh_app_release.apk -d sosh_source

# 2. Attacker locates the compiled JavaScript bundle
cd sosh_source/assets/

# 3. Attacker uses regex to grep for the exposed Anthropic API key format (sk-ant-...)
grep -oE 'sk-ant-[a-zA-Z0-9_-]{50,}' index.android.bundle
```
*Result:* The attacker immediately obtains the live, production Anthropic API key. They can then script millions of LLM requests to Anthropic at your expense, potentially costing thousands of dollars before the key is revoked.

### ✅ Recommended Solution: Backend Proxy 
**Options for Implementation:**
You must **never** embed 3rd-party private keys in a client app. 
1. **Remove `EXPO_PUBLIC_` prefixes** for these keys.
2. **Build an intermediary backend service** (using Node.js/Express, Next.js API Routes, or Firebase Cloud Functions).
3. The React Native app should send the user's secure authentication token to your backend.
4. Your backend verifies the token, securely attaches the `ANTHROPIC_API_KEY` from its own secure environment, and forwards the request to Anthropic.

By doing this, the API keys stay safely on your server, and you can enforce rate-limiting per user to prevent abuse.
