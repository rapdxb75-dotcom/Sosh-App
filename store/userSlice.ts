import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import storageService from "../services/storage";

interface UserState {
  userName: string;
  email: string;
  profilePicture: string | null;
  loading: boolean;
  isLoggedIn: boolean;
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
}

const initialState: UserState = {
  userName: "RAPDXB",
  email: "",
  profilePicture: null,
  loading: false,
  isLoggedIn: false,
  aiAdditions: undefined,
};

// Async thunk to initialize user data from storage
export const initializeUser = createAsyncThunk("user/initialize", async () => {
  const [userName, email, profilePicture, token] = await Promise.all([
    storageService.getUsername(),
    storageService.getEmail(),
    storageService.getProfilePicture(),
    storageService.getToken(),
  ]);
  return {
    userName: userName || "RAPDXB",
    email: email || "",
    profilePicture,
    isLoggedIn: !!token,
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
      state.isLoggedIn = true;
    },
    clearUserData: (state) => {
      state.userName = "RAPDXB";
      state.email = "";
      state.profilePicture = null;
      state.isLoggedIn = false;
      state.aiAdditions = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initializeUser.fulfilled, (state, action) => {
      state.userName = action.payload.userName;
      state.email = action.payload.email;
      state.profilePicture = action.payload.profilePicture;
      state.isLoggedIn = action.payload.isLoggedIn;
    });
  },
});

export const { setUserData, clearUserData } = userSlice.actions;

// Action to update state AND storage
export const updateUser =
  (data: {
    userName?: string;
    email?: string;
    profilePicture?: string | null;
    aiAdditions?: any;
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
