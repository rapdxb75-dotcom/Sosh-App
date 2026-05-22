import { doc, setDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import {
  endConnection,
  ErrorCode,
  finishTransaction,
  getAvailablePurchases,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  type Purchase,
} from 'react-native-iap';
import Toast from 'react-native-toast-message';
import { initializeFirebase } from '../services/firebase';
import { getFirestore } from 'firebase/firestore';

export const SKUS = {
  PRO: Platform.select({ ios: 'sosh.pro.monthly', android: 'sosh.pro.monthly' }) as string,
  BUSINESS: Platform.select({ ios: 'sosh.enterprise.monthly', android: 'sosh.enterprise.monthly' }) as string,
};

/**
 * Maps a product SKU to the Sosh plan name.
 */
export const skuToPlan = (sku: string): 'Pro' | 'Business' | null => {
  if (sku === SKUS.PRO) return 'Pro';
  if (sku === SKUS.BUSINESS) return 'Business';
  return null;
};

/**
 * Persists the confirmed subscription to Firebase so the admin panel
 * and other devices stay in sync.
 */
export const syncSubscriptionToFirebase = async (
  email: string,
  plan: 'Pro' | 'Business',
  purchasedAt: string,
) => {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const { app } = initializeFirebase();
    const db = getFirestore(app);
    const userDocRef = doc(db, 'users', normalizedEmail);

    await setDoc(
      userDocRef,
      {
        subscription: { plan, isSubscribed: true },
        purchasedAt,
      },
      { merge: true },
    );
    console.log(`✅ [IAP] Subscription synced to Firebase: ${plan}, purchasedAt=${purchasedAt}`);
  } catch (err) {
    console.error('❌ [IAP] Failed to sync subscription to Firebase:', err);
  }
};

/**
 * Checks Apple / Google billing directly for active subscriptions.
 * Returns the currently active plan or null if no active subscription.
 *
 * getAvailablePurchases() only returns non-expired subscriptions — if the
 * subscription has lapsed Apple/Google will not include it in the list.
 *
 * Call this on app launch so the app always reflects real billing status
 * rather than relying solely on the cached purchasedAt + 30-day estimate.
 */
export const checkSubscriptionStatus = async (): Promise<{
  plan: 'Pro' | 'Business' | null;
  purchasedAt: string | null;
} | null> => {
  try {
    await initConnection();

    const availablePurchases = await getAvailablePurchases();

    for (const purchase of availablePurchases) {
      const plan = skuToPlan(purchase.productId);
      if (plan) {
        const purchasedAt = purchase.transactionDate
          ? new Date(purchase.transactionDate).toISOString()
          : new Date().toISOString();

        console.log(`✅ [IAP] Active subscription found: ${plan} (${purchasedAt})`);
        return { plan, purchasedAt };
      }
    }

    console.log('ℹ️ [IAP] No active subscription found via getAvailablePurchases()');
    return { plan: null, purchasedAt: null };
  } catch (err) {
    // Non-fatal — fall back to Firebase/Redux state
    console.warn('⚠️ [IAP] checkSubscriptionStatus error (non-fatal):', err);
    return null;
  } finally {
    try {
      await endConnection();
    } catch (_) {
      // ignore cleanup errors
    }
  }
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useIAP = (onPurchaseSuccess?: () => void, userEmail?: string) => {
  useEffect(() => {
    let purchaseUpdateSub: { remove: () => void } | null = null;
    let purchaseErrorSub: { remove: () => void } | null = null;

    const initIAP = async () => {
      try {
        await initConnection();

        // Small delay to let native billing clients fully start
        await new Promise(resolve => setTimeout(resolve, 500));

        purchaseUpdateSub = purchaseUpdatedListener(
          async (purchase: Purchase) => {
            // In react-native-iap v15 the receipt is confirmed server-side or via
            // finishTransaction. We finish the transaction here optimistically.
            try {
              await finishTransaction({ purchase, isConsumable: false });

              // ── Sync to Firebase ──────────────────────────────────────
              const plan = skuToPlan(purchase.productId);
              if (plan && userEmail) {
                const purchasedAt = purchase.transactionDate
                  ? new Date(purchase.transactionDate).toISOString()
                  : new Date().toISOString();

                await syncSubscriptionToFirebase(userEmail, plan, purchasedAt);
              }
              // ──────────────────────────────────────────────────────────

              Toast.show({
                type: 'success',
                text1: 'Purchase Successful',
                text2: 'Welcome to Sosh Premium!',
              });

              if (onPurchaseSuccess) {
                onPurchaseSuccess();
              }
            } catch (ackErr) {
              console.warn('[IAP] finishTransaction error:', ackErr);
            }
          },
        );

        purchaseErrorSub = purchaseErrorListener((error) => {
          console.warn('[IAP] purchaseErrorListener:', error);
          // ErrorCode.UserCancelled is the v15 equivalent of the old 'E_USER_CANCELLED'
          if (error.code !== ErrorCode.UserCancelled) {
            Toast.show({
              type: 'error',
              text1: 'Purchase Failed',
              text2: error.message,
            });
          }
        });
      } catch (err) {
        console.warn('[IAP] Init Error:', err);
      }
    };

    initIAP();

    return () => {
      purchaseUpdateSub?.remove();
      purchaseErrorSub?.remove();
      endConnection();
    };
  }, [onPurchaseSuccess, userEmail]);

  // ── Restore Purchases ───────────────────────────────────────────────────────
  const handleRestore = async () => {
    try {
      const purchases = await getAvailablePurchases();

      const activePurchase = purchases.find(p => skuToPlan(p.productId) !== null);

      if (activePurchase) {
        const plan = skuToPlan(activePurchase.productId)!;
        const purchasedAt = activePurchase.transactionDate
          ? new Date(activePurchase.transactionDate).toISOString()
          : new Date().toISOString();

        if (userEmail) {
          await syncSubscriptionToFirebase(userEmail, plan, purchasedAt);
        }

        Toast.show({
          type: 'success',
          text1: 'Purchases Restored',
          text2: `Your ${plan} plan has been unlocked.`,
        });

        if (onPurchaseSuccess) {
          onPurchaseSuccess();
        }
      } else {
        Toast.show({
          type: 'info',
          text1: 'No Active Subscription',
          text2: "We couldn't find any active subscriptions on your Apple ID.",
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Restore Failed',
        text2: err.message || 'An error occurred while restoring purchases.',
      });
    }
  };

  // ── Purchase ────────────────────────────────────────────────────────────────
  const handlePurchase = async (sku: string) => {
    try {
      await requestPurchase({
        type: 'subs',
        request: {
          apple: { sku },
          google: { skus: [sku] },
        },
      });
    } catch (err: any) {
      console.warn('[IAP] requestPurchase error:', err.code, err.message);
      if (err.code !== ErrorCode.UserCancelled) {
        Toast.show({
          type: 'error',
          text1: 'Purchase Error',
          text2: err.message,
        });
        Alert.alert('Purchase Error', err.message);
      }
    }
  };

  return {
    handlePurchase,
    handleRestore,
  };
};
