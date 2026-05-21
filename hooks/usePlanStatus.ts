import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { isPlanExpired, getDaysRemaining } from "../utils/subscription";

/**
 * Central hook for subscription / plan access control.
 *
 * Usage:
 *   const { effectivePlan, isExpired, canAccessPro, daysLeft } = usePlanStatus();
 *
 * Rules:
 *  - effectivePlan  : the REAL plan for gating.  If a Pro/Business plan has
 *                     expired, this returns "Free" even if Redux still shows "Pro".
 *  - isExpired      : true when the user had a paid plan but it has now lapsed.
 *  - canAccessPro   : true if the user has an active (non-expired) Pro or Business plan.
 *  - canAccessBusiness: true if the user has an active Business plan.
 *  - daysLeft       : calendar days remaining in the current 30-day cycle.
 */
export function usePlanStatus() {
  const subscription = useSelector((state: RootState) => state.user.subscription);
  // purchasedAt is stored in Firebase and surfaced via the real-time listener
  // that updates Redux via setUserData → profile.tsx reads it from local state.
  // We use the Redux-level purchasedAt that home.tsx syncs from Firestore.
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

  // Expiry check — only relevant for paid plans
  const isExpired = isPaidPlan && isPlanExpired(purchasedAt);

  // The "real" plan after accounting for expiry
  const effectivePlan: "Free" | "Pro" | "Business" = isExpired
    ? "Free"
    : normalizedPlan;

  const canAccessPro =
    effectivePlan === "Pro" || effectivePlan === "Business";

  const canAccessBusiness = effectivePlan === "Business";

  const daysLeft = isPaidPlan && !isExpired ? getDaysRemaining(purchasedAt) : 0;

  return {
    /** The plan after applying expiry logic — use this for all feature gates */
    effectivePlan,
    /** The raw plan stored in Redux (may still say Pro even if expired) */
    rawPlan: normalizedPlan,
    /** true if the plan has lapsed (paid plan but 30 days have passed) */
    isExpired,
    /** true if the user has an active Pro or Business subscription */
    canAccessPro,
    /** true if the user has an active Business subscription */
    canAccessBusiness,
    /** Calendar days remaining in the current billing cycle (0 if Free/expired) */
    daysLeft,
    /** true if the user is on the Free tier OR their plan has expired */
    isFreeTier: effectivePlan === "Free",
  };
}
