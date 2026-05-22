# useIAP Hook Documentation

`useIAP` is the central In-App Purchase hook that manages the `react-native-iap` lifecycle, listens for purchase updates and errors, exposes purchase/restore actions, and syncs confirmed subscriptions to Firebase.

It also exports three standalone utilities (`SKUS`, `skuToPlan`, `syncSubscriptionToFirebase`, `checkSubscriptionStatus`) that can be imported independently by launch-time code.

---

## 1. 🧠 Logic / Business Logic

### Exported Constants

#### `SKUS`
| Key | iOS SKU | Android SKU |
| :--- | :--- | :--- |
| `PRO` | `sosh.pro.monthly` | `sosh.pro.monthly` |
| `BUSINESS` | `sosh.enterprise.monthly` | `sosh.enterprise.monthly` |

---

### Exported Utilities

#### `skuToPlan(sku: string): 'Pro' | 'Business' | null`
Maps a product ID to a Sosh plan name. Returns `null` for unrecognised SKUs.

#### `syncSubscriptionToFirebase(email, plan, purchasedAt)`
Writes `{ subscription: { plan, isSubscribed: true }, purchasedAt }` to the user's Firestore document (keyed by normalised email). Uses `merge: true` so other fields are preserved. Errors are caught and logged non-fatally.

#### `checkSubscriptionStatus(): Promise<{ plan, purchasedAt } | null>`
Standalone function (no hook required) for verifying subscription status directly against Apple/Google on app launch:
1. Opens IAP connection (`initConnection`).
2. Calls `getAvailablePurchases()` — only returns **non-expired** subscriptions from Apple/Google.
3. Returns `{ plan, purchasedAt }` for the first matching SKU, or `{ plan: null, purchasedAt: null }` if none found.
4. Returns `null` on error (non-fatal — caller falls back to Firebase/Redux state).
5. Always closes the connection in `finally`.

> **Key behaviour**: `getAvailablePurchases()` is the authoritative source of truth. If Apple/Google does not include a subscription in this list, it has lapsed even if the local cache still shows it as active.

---

### Hook: `useIAP(onPurchaseSuccess?, userEmail?)`

#### Parameters
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `onPurchaseSuccess` | `() => void` | Optional callback — called after a successful purchase or restore. Typically `onClose` from the Paywall. |
| `userEmail` | `string` | The authenticated user's email, used for Firebase sync. |

#### `useEffect` — IAP Lifecycle
Runs on mount (re-runs if `onPurchaseSuccess` or `userEmail` changes):
1. `initConnection()` — opens billing client.
2. 500 ms delay to allow native billing clients to fully start.
3. **`purchaseUpdatedListener`**: Fires when Apple/Google confirms a transaction:
   - Calls `finishTransaction({ purchase, isConsumable: false })` to acknowledge.
   - Calls `syncSubscriptionToFirebase(userEmail, plan, purchasedAt)`.
   - Shows a success `Toast`.
   - Calls `onPurchaseSuccess()`.
4. **`purchaseErrorListener`**: Fires on error. Shows an error `Toast` unless the error code is `UserCancelled`.
5. Cleanup: removes both listeners and calls `endConnection()`.

#### `handleRestore(): Promise<void>`
- Calls `getAvailablePurchases()` to fetch active subscriptions.
- If found: syncs to Firebase, shows success Toast, calls `onPurchaseSuccess()`.
- If not found: shows an info Toast.
- On error: shows an error Toast.

#### `handlePurchase(sku: string): Promise<void>`
- Calls `requestPurchase({ type: 'subs', request: { apple: { sku }, google: { skus: [sku] } } })`.
- On error (excluding `UserCancelled`): shows error Toast + `Alert.alert`.

---

## 2. 🔌 API / Service Integration

| Library | Usage |
| :--- | :--- |
| `react-native-iap` | `initConnection`, `endConnection`, `requestPurchase`, `getAvailablePurchases`, `finishTransaction`, `purchaseUpdatedListener`, `purchaseErrorListener` |
| `firebase/firestore` | `setDoc` with `merge: true` on `users/{email}` |
| `initializeFirebase` | Gets the Firebase `app` instance for `getFirestore` |
| `react-native-toast-message` | User-facing feedback for success, info, and error states |

---

## 3. 🎨 UI / User Interface

`useIAP` has no visual output of its own. All UI feedback is delivered via `react-native-toast-message` `Toast.show()` calls.

### Toast Messages

| Trigger | Type | Title | Body |
| :--- | :--- | :--- | :--- |
| Purchase confirmed | `success` | "Purchase Successful" | "Welcome to Sosh Premium!" |
| IAP error | `error` | "Purchase Failed" | `error.message` |
| Restore success | `success` | "Purchases Restored" | `"Your ${plan} plan has been unlocked."` |
| Restore — no active sub | `info` | "No Active Subscription" | Explanation string |
| Restore error | `error` | "Restore Failed" | `err.message` |
| Purchase error | `error` | "Purchase Error" | `err.message` |

### Firebase Sync Data Shape
```ts
{
  subscription: { plan: 'Pro' | 'Business', isSubscribed: true },
  purchasedAt: '<ISO date string>',
}
```
