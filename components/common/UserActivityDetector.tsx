import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
import { updateUserActivityStatus } from "../../services/firebase";
import { RootState } from "../../store/store";

interface UserActivityDetectorProps {
  children: React.ReactNode;
}

export const UserActivityDetector: React.FC<UserActivityDetectorProps> = ({
  children,
}) => {
  const email = useSelector((state: RootState) => state.user.email);
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

  // Timestamps
  const lastInteractionRef = useRef<number>(Date.now());
  const potentialActiveStartRef = useRef<number | null>(null);
  
  // States
  const [isActive, setIsActive] = useState(false);
  const isActiveRef = useRef(false);

  const ACTIVE_THRESHOLD = 30 * 1000; // 30 seconds of activity to be considered "Active"
  const INACTIVE_THRESHOLD = 60 * 1000; // 1 minute of silence to be considered "Inactive"

  const handleInteraction = () => {
    const now = Date.now();
    lastInteractionRef.current = now;

    // If we haven't started tracking potential activity yet
    if (potentialActiveStartRef.current === null) {
      console.log("⏱️ [UserActivity] Interaction detected, starting activity tracking...");
      potentialActiveStartRef.current = now;
    }

    // Check if we've reached the 30s threshold
    if (!isActiveRef.current) {
      const timeDiff = now - potentialActiveStartRef.current;
      if (timeDiff % 5000 < 1000) { // Log every ~5s of potential activity
        console.log(`⏱️ [UserActivity] Potential activity: ${Math.floor(timeDiff/1000)}s / 30s`);
      }
      if (timeDiff >= ACTIVE_THRESHOLD) {
        console.log("🔥 User is now ACTIVE (30s threshold reached)");
        isActiveRef.current = true;
        setIsActive(true);
        if (isLoggedIn && email) {
          updateUserActivityStatus(email);
        }
      }
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !email) {
      // Reset if logged out
      isActiveRef.current = false;
      setIsActive(false);
      potentialActiveStartRef.current = null;
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastInteraction = now - lastInteractionRef.current;

      // Check for inactivity (1 minute)
      if (timeSinceLastInteraction >= INACTIVE_THRESHOLD) {
        if (isActiveRef.current || potentialActiveStartRef.current !== null) {
          console.log("💤 User is now INACTIVE or Resetting tracking (1m threshold reached)");
          isActiveRef.current = false;
          setIsActive(false);
          potentialActiveStartRef.current = null;
        }
      } else if (isActiveRef.current) {
        // If still active, periodically update lastLogin to keep it fresh for the admin dashboard
        // We do this every 20 seconds while active to ensure the admin dashboard (30s threshold) stays green
        const timeSinceLastUpdate = now - potentialActiveStartRef.current;
        if (timeSinceLastUpdate >= 20000) {
          console.log("🔄 [UserActivity] Refreshing active status (20s heartbeat)");
          potentialActiveStartRef.current = now; // Reset the sub-timer for heartbeat
          if (isLoggedIn && email) {
            updateUserActivityStatus(email);
          }
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [isLoggedIn, email]);

  return (
    <View
      style={{ flex: 1 }}
      onStartShouldSetResponderCapture={() => {
        handleInteraction();
        return false; // Don't capture, let children handle it
      }}
    >
      {children}
    </View>
  );
};
