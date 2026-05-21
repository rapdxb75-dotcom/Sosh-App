/**
 * Subscription expiry utilities.
 * Standard billing cycle = 30 calendar days from purchasedAt date.
 */

/**
 * Returns true if the paid plan has expired (purchasedAt + 30 days <= now).
 * A missing purchasedAt date is treated as expired.
 */
export const isPlanExpired = (purchasedAt: string | null | undefined): boolean => {
  if (!purchasedAt) return true;

  const purchaseDate = new Date(purchasedAt);
  // Guard against invalid date strings
  if (isNaN(purchaseDate.getTime())) return true;

  const expiryDate = new Date(purchaseDate);
  expiryDate.setDate(expiryDate.getDate() + 30);

  return new Date() > expiryDate;
};

/**
 * Returns the number of whole days remaining in the current billing cycle.
 * Returns 0 if the plan is already expired.
 */
export const getDaysRemaining = (purchasedAt: string | null | undefined): number => {
  if (!purchasedAt) return 0;

  const purchaseDate = new Date(purchasedAt);
  if (isNaN(purchaseDate.getTime())) return 0;

  const expiryDate = new Date(purchaseDate);
  expiryDate.setDate(expiryDate.getDate() + 30);

  const diffMs = expiryDate.getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};

/**
 * Returns the expiry date (purchasedAt + 30 days) as a formatted string,
 * e.g. "Jun 20, 2026". Returns null if purchasedAt is invalid.
 */
export const getPlanExpiryDateString = (
  purchasedAt: string | null | undefined,
): string | null => {
  if (!purchasedAt) return null;

  const purchaseDate = new Date(purchasedAt);
  if (isNaN(purchaseDate.getTime())) return null;

  const expiryDate = new Date(purchaseDate);
  expiryDate.setDate(expiryDate.getDate() + 30);

  return expiryDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
