# usePlanStatus Hook Documentation

`usePlanStatus` is the **single source of truth** for subscription access control. It reads from Redux and applies expiry logic to produce a derived `effectivePlan` that all feature gates across the app must use.

> **Rule**: Never gate features directly on `state.user.subscription.plan`. Always use `usePlanStatus().effectivePlan` or its derived booleans.

---

## 1. 🧠 Logic / Business Logic

### Purpose
Centralise the calculation of whether a paid subscription is still valid — preventing stale Redux/JWT cache from granting access to premium features after a billing cycle has ended.

### Expiry Resolution Priority

| Priority | Source | When Used |
| :--- | :--- | :--- |
| 1 (Authoritative) | `expiresAt` (Redux) | Set from Apple/Google via `checkSubscriptionStatus()` on app launch. Reflects real billing expiry. |
| 2 (Fallback) | `purchasedAt` + 30 days | Used when `expiresAt` is absent. Legacy estimate based on last known transaction date. |

`expiresAt` is written to Redux by the launch-time IAP check (`_layout.tsx`) and after each successful purchase/restore. If neither date is present, the user is treated as Free.

### Return Value

| Field | Type | Description |
| :--- | :--- | :--- |
| `effectivePlan` | `"Free" \| "Pro" \| "Business"` | The real plan after expiry. Use **this** for all feature gates. |
| `rawPlan` | `"Free" \| "Pro" \| "Business"` | The plan stored in Redux (may still say "Pro" even if expired). |
| `isExpired` | `boolean` | `true` when the user had a paid plan that has lapsed. |
| `canAccessPro` | `boolean` | `true` if `effectivePlan` is Pro **or** Business (non-expired). |
| `canAccessBusiness` | `boolean` | `true` if `effectivePlan` is Business (non-expired). |
| `daysLeft` | `number` | Calendar days remaining in the billing cycle. `0` if Free or expired. |
| `isFreeTier` | `boolean` | `true` if `effectivePlan` is "Free" (includes lapsed plans). |
| `expiresAt` | `string \| null` | Raw Apple/Google expiry ISO date from Redux (may be null). |

### Expiry Calculation Detail

```ts
// If expiresAt is set (authoritative):
isExpired = new Date() > new Date(expiresAt)

// If only purchasedAt is set (30-day fallback):
isExpired = isPlanExpired(purchasedAt)   // from utils/subscription
```

`daysLeft` uses the same priority:
- With `expiresAt`: `Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))`
- Without: `getDaysRemaining(purchasedAt)` from `utils/subscription`

### Plan Normalization
Raw plan strings from Redux/JWT may be lowercase (e.g., `"pro"`). The hook normalises all values to title-case before comparisons:
```ts
rawPlan.charAt(0).toUpperCase() + rawPlan.slice(1).toLowerCase()
// "pro" → "Pro", "business" → "Business", "free" → "Free"
```

---

## 2. 🔌 API / Service Integration

| Module | Usage |
| :--- | :--- |
| Redux `state.user.subscription` | Source of `rawPlan` |
| Redux `state.user.expiresAt` | Authoritative Apple/Google expiry date |
| Redux `state.user.purchasedAt` | Fallback purchase date for 30-day expiry math |
| `utils/subscription` | `isPlanExpired(purchasedAt)`, `getDaysRemaining(purchasedAt)` |

*No network calls — purely derived from Redux state.*

---

## 3. Usage Examples

### Basic feature gate
```tsx
const { canAccessPro, effectivePlan } = usePlanStatus();

if (!canAccessPro) {
  setPaywallVisible(true);
  return;
}
// proceed with Pro feature
```

### Expired plan UI
```tsx
const { isExpired, rawPlan } = usePlanStatus();

if (isExpired) {
  return <UpgradePlanButton />;
}
```

### Remaining days display
```tsx
const { daysLeft, isFreeTier } = usePlanStatus();

if (!isFreeTier) {
  return <Text>{daysLeft} days remaining</Text>;
}
```

### Where It Is Used
| File | Gate Applied |
| :--- | :--- |
| `createPost.tsx` | AI caption generation, post scheduling, platform access |
| `postPreview.tsx` | Preview and publish actions for premium platforms |
| `ai.tsx` | AI chat session initiation and usage limits |
| `profile.tsx` | Plan card display, "Upgrade Plan" button on expiry |
| `components/login/LoginForm.tsx` | Re-validates plan on login to prevent stale cache access |
