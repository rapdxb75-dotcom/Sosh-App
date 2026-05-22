import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import storageService from "../services/storage";

interface UserState {
  userName: string;
  email: string;
  profilePicture: string | null;
  loading: boolean;
  isLoggedIn: boolean;
  subscription: {
    plan: "Free" | "Pro" | "Business";
    isSubscribed: boolean;
  };
  aiConsent: boolean;
  aiAdditions?: {
    poppyAIChatbot?: {
      active: boolean;
      boardId: string;
      chatId: string;
    };
    poppyPostCaption?: {
      active: boolean;
      boardId: string;
      chatId: string;
    };
    poppyShortCaption?: {
      active: boolean;
      boardId: string;
      chatId: string;
    };
    claudeAgent?: {
      active: boolean;
      model: string;
    };
  };
  systemPrompt?: string;
  aiChatCount?: number;
  postCaptionCount?: number;
  reelCaptionCount?: number;
  purchasedAt?: string | null;  // ISO date — plan purchase/renewal date (last known transaction)
  expiresAt?: string | null;    // ISO date — real Apple/Google subscription expiry date
  registrationBuffer: {
    fullName: string;
    userName: string;
    email: string;
    password: string;
    checkbox: boolean;
  } | null;
  loginBuffer: {
    token: string;
    email: string;
    password?: string;
    userName: string;
    profilePicture?: string | null;
    subscription: {
      plan: "Free" | "Pro" | "Business";
      isSubscribed: boolean;
    };
  } | null;
  onboardingData?: any;
}

const initialState: UserState = {
  userName: "",
  email: "",
  profilePicture: null,
  loading: false,
  isLoggedIn: false,
  subscription: {
    plan: "Free",
    isSubscribed: false,
  },
  aiConsent: false,
  aiAdditions: undefined,
  systemPrompt: undefined,
  aiChatCount: 0,
  postCaptionCount: 0,
  reelCaptionCount: 0,
  purchasedAt: null,
  expiresAt: null,
  registrationBuffer: null,
  loginBuffer: null,
  onboardingData: undefined,
};

// Async thunk to initialize user data from storage
export const initializeUser = createAsyncThunk("user/initialize", async () => {
  const results = await Promise.all([
    storageService.getUsername(),
    storageService.getEmail(),
    storageService.getProfilePicture(),
    storageService.getToken(),
    storageService.getAIConsent(),
    storageService.getAIChatCount(),
  ]);
  const [userName, email, profilePicture, token, aiConsent, aiChatCount] = results;
  let subscription: {
    plan: "Free" | "Pro" | "Business";
    isSubscribed: boolean;
  } = { plan: "Free", isSubscribed: false };

  if (token) {
    try {
      const decoded: any = jwtDecode(token || "");
      if (decoded.subscription) {
        const rawPlan = String(decoded.subscription);
        const normalizedPlan = (rawPlan.charAt(0).toUpperCase() + rawPlan.slice(1).toLowerCase()) as "Free" | "Pro" | "Business";
        subscription = {
          plan: normalizedPlan,
          isSubscribed: normalizedPlan !== "Free",
        };
      }
    } catch (e) {
      console.error("Failed to decode token on init", e);
    }
  }

  return {
    userName: userName || "",
    email: email || "",
    profilePicture,
    isLoggedIn: !!token,
    subscription,
    aiConsent: results[4] || false,
    aiChatCount: results[5] || 0,
  };
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (
      state,
      action: PayloadAction<{
        userName?: string;
        email?: string;
        profilePicture?: string | null;
        aiAdditions?: any;
        systemPrompt?: string;
        aiChatCount?: number;
        postCaptionCount?: number;
        reelCaptionCount?: number;
        purchasedAt?: string | null;
        expiresAt?: string | null;
        subscription?: {
          plan: "Free" | "Pro" | "Business";
          isSubscribed: boolean;
        };
        onboardingData?: any;
        aiConsent?: boolean;
      }>,
    ) => {
      if (action.payload.userName !== undefined) {
        state.userName = action.payload.userName;
      }
      if (action.payload.email !== undefined) {
        state.email = action.payload.email;
      }
      if (action.payload.profilePicture !== undefined) {
        state.profilePicture = action.payload.profilePicture;
      }
      if (action.payload.aiAdditions !== undefined) {
        state.aiAdditions = action.payload.aiAdditions;
      }
      if (action.payload.systemPrompt !== undefined) {
        state.systemPrompt = action.payload.systemPrompt;
      }
      if (action.payload.aiChatCount !== undefined) {
        state.aiChatCount = action.payload.aiChatCount;
      }
      if (action.payload.postCaptionCount !== undefined) {
        state.postCaptionCount = action.payload.postCaptionCount;
      }
      if (action.payload.reelCaptionCount !== undefined) {
        state.reelCaptionCount = action.payload.reelCaptionCount;
      }
      if (action.payload.purchasedAt !== undefined) {
        state.purchasedAt = action.payload.purchasedAt;
      }
      if (action.payload.expiresAt !== undefined) {
        state.expiresAt = action.payload.expiresAt;
      }
      if (action.payload.subscription !== undefined) {
        const rawPlan = action.payload.subscription.plan || "Free";
        const normalizedPlan = (rawPlan.charAt(0).toUpperCase() + rawPlan.slice(1).toLowerCase()) as "Free" | "Pro" | "Business";
        state.subscription = {
          ...action.payload.subscription,
          plan: normalizedPlan,
        };
      }
      if (action.payload.onboardingData !== undefined) {
        state.onboardingData = action.payload.onboardingData;
      }
      if (action.payload.aiConsent !== undefined) {
        state.aiConsent = action.payload.aiConsent;
      }
      state.isLoggedIn = true;
    },
    setAIConsent: (state, action: PayloadAction<boolean>) => {
      state.aiConsent = action.payload;
    },
    clearUserData: (state) => {
      state.userName = "";
      state.email = "";
      state.profilePicture = null;
      state.isLoggedIn = false;
      state.aiAdditions = undefined;
      state.systemPrompt = undefined;
      state.aiChatCount = 0;
      state.postCaptionCount = 0;
      state.reelCaptionCount = 0;
      state.purchasedAt = null;
      state.expiresAt = null;
      state.registrationBuffer = null;
      state.loginBuffer = null;
      state.onboardingData = undefined;
      state.subscription = { plan: "Free", isSubscribed: false };
      state.aiConsent = false;
    },
    setRegistrationBuffer: (
      state,
      action: PayloadAction<UserState["registrationBuffer"]>,
    ) => {
      state.registrationBuffer = action.payload;
    },
    setLoginBuffer: (
      state,
      action: PayloadAction<UserState["loginBuffer"]>,
    ) => {
      state.loginBuffer = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initializeUser.fulfilled, (state, action) => {
      state.userName = action.payload.userName;
      state.email = action.payload.email;
      state.profilePicture = action.payload.profilePicture;
      state.isLoggedIn = action.payload.isLoggedIn;
      state.subscription = action.payload.subscription;
      state.aiConsent = action.payload.aiConsent;
      state.aiChatCount = action.payload.aiChatCount;
    });
  },
});

export const {
  setUserData,
  clearUserData,
  setRegistrationBuffer,
  setLoginBuffer,
  setAIConsent,
} = userSlice.actions;

// Action to update state AND storage
export const updateUser =
  (data: {
    userName?: string;
    email?: string;
    profilePicture?: string | null;
    aiAdditions?: any;
    systemPrompt?: string;
    aiChatCount?: number;
    postCaptionCount?: number;
    reelCaptionCount?: number;
    purchasedAt?: string | null;
    expiresAt?: string | null;
    subscription?: {
      plan: "Free" | "Pro" | "Business";
      isSubscribed: boolean;
    };
    aiConsent?: boolean;
  }) =>
    async (dispatch: any) => {
      dispatch(setUserData(data));
      if (data.userName !== undefined) {
        await storageService.setUsername(data.userName);
      }
      if (data.email !== undefined) {
        await storageService.setEmail(data.email);
      }
      if (data.profilePicture !== undefined) {
        await storageService.setProfilePicture(data.profilePicture || "");
      }
      if (data.aiConsent !== undefined) {
        await storageService.setAIConsent(data.aiConsent);
      }
      if (data.aiChatCount !== undefined) {
        await storageService.setAIChatCount(data.aiChatCount);
      }
    };

export default userSlice.reducer;
