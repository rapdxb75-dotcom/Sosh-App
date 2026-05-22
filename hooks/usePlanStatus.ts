import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { isPlanExpired, getDaysRemaining } from "../utils/subscription";

/**
 * Central hook for subscription / plan access control.
 *
 * Usage:
 *   const { effectivePlan, isExpired, canAccessPro, daysLeft } = usePlanStatus();
 *
 * Expiry resolution order (most-authoritative first):
 *   1. expiresAt  — real Apple/Google expiry date written on purchase/restore/launch
 *   2. purchasedAt — falls back to purchasedAt + 30 days when expiresAt is absent
 *
 * Rules:
 *  - effectivePlan  : the REAL plan for gating.  If a Pro/Business plan has
 *                     expired, this returns "Free" even if Redux still shows "Pro".
 *  - isExpired      : true when the user had a paid plan but it has now lapsed.
 *  - canAccessPro   : true if the user has an active (non-expired) Pro or Business plan.
 *  - canAccessBusiness: true if the user has an active Business plan.
 *  - daysLeft       : calendar days remaining in the current billing cycle.
 */
export function usePlanStatus() {
  const subscription = useSelector((state: RootState) => state.user.subscription);

  // expiresAt — set from Apple/Google via getAvailablePurchases() on launch.
  // This is the authoritative expiry date and takes priority over purchasedAt math.
  const expiresAt = useSelector(
    (state: RootState) => (state.user as any).expiresAt ?? null,
  );

  // purchasedAt — fallback: expiry = purchasedAt + 30 days (used when expiresAt is absent)
  const purchasedAt = useSelector(
    (state: RootState) => (state.user as any).purchasedAt ?? null,
  );

  const rawPlan = subscription?.plan ?? "Free";
  const normalizedPlan =
    (rawPlan.charAt(0).toUpperCase() + rawPlan.slice(1).toLowerCase()) as
      | "Free"
      | "Pro"
      | "Business";

  const isPaidPlan = normalizedPlan === "Pro" || normalizedPlan === "Business";

  // ── Expiry check ─────────────────────────────────────────────────────────
  // Priority 1: Real Apple/Google expiresAt date
  // Priority 2: purchasedAt + 30 days (legacy fallback)
  let isExpired = false;
  if (isPaidPlan) {
    if (expiresAt) {
      // Use the authoritative Apple/Google expiry date
      isExpired = new Date() > new Date(expiresAt);
    } else {
      // Fall back to the 30-day purchase math
      isExpired = isPlanExpired(purchasedAt);
    }
  }

  // The "real" plan after accounting for expiry
  const effectivePlan: "Free" | "Pro" | "Business" = isExpired
    ? "Free"
    : normalizedPlan;

  const canAccessPro =
    effectivePlan === "Pro" || effectivePlan === "Business";

  const canAccessBusiness = effectivePlan === "Business";

  // Days remaining: if expiresAt is present use it directly, else use purchasedAt math
  const daysLeft = (() => {
    if (!isPaidPlan || isExpired) return 0;
    if (expiresAt) {
      const diffMs = new Date(expiresAt).getTime() - Date.now();
      return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }
    return getDaysRemaining(purchasedAt);
  })();

  return {
    /** The plan after applying expiry logic — use this for all feature gates */
    effectivePlan,
    /** The raw plan stored in Redux (may still say Pro even if expired) */
    rawPlan: normalizedPlan,
    /** true if the plan has lapsed */
    isExpired,
    /** true if the user has an active Pro or Business subscription */
    canAccessPro,
    /** true if the user has an active Business subscription */
    canAccessBusiness,
    /** Calendar days remaining in the current billing cycle (0 if Free/expired) */
    daysLeft,
    /** true if the user is on the Free tier OR their plan has expired */
    isFreeTier: effectivePlan === "Free",
    /** The authoritative Apple/Google expiry date (may be null until first launch check) */
    expiresAt,
  };
}
