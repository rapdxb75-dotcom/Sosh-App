import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import Toast from 'react-native-toast-message';

export const SKUS = {
  PRO: Platform.select({ ios: 'sosh.pro.monthly', android: 'sosh.pro.monthly' }) as string,
  BUSINESS: Platform.select({ ios: 'sosh.enterprise.monthly', android: 'sosh.enterprise.monthly' }) as string,
};

export const useIAP = (onPurchaseSuccess?: () => void) => {
  useEffect(() => {
    let purchaseUpdateSubscription: any = null;
    let purchaseErrorSubscription: any = null;

    const initIAP = async () => {
      try {
        await RNIap.initConnection();
        if (Platform.OS === 'android') {
          await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
        }

        try {
          // Pre-fetch subscriptions to populate the cache
          const skus = [SKUS.PRO, SKUS.BUSINESS];
          await RNIap.fetchProducts({ skus, type: 'subs' });
        } catch (fetchErr) {
          console.warn('Error pre-fetching subscriptions:', fetchErr);
        }

        purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
          async (purchase) => {
            const receipt = purchase.transactionReceipt;
            if (receipt) {
              try {
                await RNIap.finishTransaction({ purchase, isConsumable: false });
                Toast.show({
                  type: 'success',
                  text1: 'Purchase Successful',
                  text2: 'Welcome to Sosh Premium!',
                });
                if (onPurchaseSuccess) {
                  onPurchaseSuccess();
                }
              } catch (ackErr) {
                console.warn('ackErr', ackErr);
              }
            }
          },
        );

        purchaseErrorSubscription = RNIap.purchaseErrorListener(
          (error) => {
            console.warn('purchaseErrorListener', error);
            if (error.code !== 'E_USER_CANCELLED') {
              Toast.show({
                type: 'error',
                text1: 'Purchase Failed',
                text2: error.message,
              });
            }
          },
        );
      } catch (err) {
        console.warn('IAP Init Error:', err);
      }
    };

    initIAP();

    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
      RNIap.endConnection();
    };
  }, [onPurchaseSuccess]);

  const handleRestore = async () => {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      if (purchases && purchases.length > 0) {
        Toast.show({
          type: 'success',
          text1: 'Purchases Restored',
          text2: 'Your premium features have been unlocked.',
        });
        if (onPurchaseSuccess) {
          onPurchaseSuccess();
        }
      } else {
        Toast.show({
          type: 'info',
          text1: 'No Purchases Found',
          text2: "We couldn't find any active subscriptions.",
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

  const handlePurchase = async (sku: string) => {
    try {
      await RNIap.requestPurchase({
        type: 'subs',
        request: {
          apple: { sku },
          google: { skus: [sku] },
        },
      });
    } catch (err: any) {
      console.warn(err.code, err.message);
      if (err.code !== 'E_USER_CANCELLED') {
        Toast.show({
          type: 'error',
          text1: 'Purchase Error',
          text2: err.message,
        });
        // Fallback to Alert in case Toast is hidden by Modal
        Alert.alert("Purchase Error", err.message);
      }
    }
  };

  return {
    handlePurchase,
    handleRestore,
  };
};
