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
  registrationBuffer: {
    fullName: string;
    userName: string;
    email: string;
    password: string;
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
  aiAdditions: undefined,
  systemPrompt: undefined,
  aiChatCount: 0,
  postCaptionCount: 0,
  reelCaptionCount: 0,
  registrationBuffer: null,
  onboardingData: undefined,
};

// Async thunk to initialize user data from storage
export const initializeUser = createAsyncThunk("user/initialize", async () => {
  const [userName, email, profilePicture, token] =
    await Promise.all([
      storageService.getUsername(),
      storageService.getEmail(),
      storageService.getProfilePicture(),
      storageService.getToken(),
    ]);
  let subscription: { plan: "Free" | "Pro" | "Business"; isSubscribed: boolean } = { plan: "Free", isSubscribed: false };

  if (token) {
    try {
      const decoded: any = jwtDecode(token || "");
      if (decoded.subscription) {
        subscription = {
          plan: decoded.subscription as "Free" | "Pro" | "Business",
          isSubscribed: decoded.subscription !== "Free",
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
        subscription?: {
          plan: "Free" | "Pro" | "Business";
          isSubscribed: boolean;
        };
        onboardingData?: any;
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
      if (action.payload.subscription !== undefined) {
        state.subscription = action.payload.subscription;
      }
      if (action.payload.onboardingData !== undefined) {
        state.onboardingData = action.payload.onboardingData;
      }
      state.isLoggedIn = true;
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
      state.registrationBuffer = null;
      state.onboardingData = undefined;
      state.subscription = { plan: "Free", isSubscribed: false };
    },
    setRegistrationBuffer: (
      state,
      action: PayloadAction<UserState["registrationBuffer"]>,
    ) => {
      state.registrationBuffer = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initializeUser.fulfilled, (state, action) => {
      state.userName = action.payload.userName;
      state.email = action.payload.email;
      state.profilePicture = action.payload.profilePicture;
      state.isLoggedIn = action.payload.isLoggedIn;
      state.subscription = action.payload.subscription;
    });
  },
});

export const { setUserData, clearUserData, setRegistrationBuffer } =
  userSlice.actions;

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
    subscription?: {
      plan: "Free" | "Pro" | "Business";
      isSubscribed: boolean;
    };
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
    };

export default userSlice.reducer;
