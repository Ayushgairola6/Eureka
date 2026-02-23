import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;

// Document type should be separate from auth state
interface Contributions_user_id_fkey {
  id: string;
  chunk_count: string;
  feedback: string;
  created_at: string;
  document_id: string;
}

interface user {
  id: string;
  username: string;
  email: string;
  isVerified: boolean;
  Contributions_user_id_fkey: Contributions_user_id_fkey[];
  created_at: string;
  IsPremiumUser: boolean;
  AllowedTrainingModels: string;
}

interface FeedbackCounts {
  upvote: number;
  downvote: number;
  partial_upvotes: number;
}
interface ChatRoom {
  room_id: string;
  room_name: string | null;
  room_type: string | null;
  created_at: string | null;
  created_by: string | null;
  Room_Description: string | null;
  Room_Joining_code: number | null;
  participant_count: number | null;
}

interface UserChatRoom {
  member_id: string;
  room_id: string;
  chat_rooms: ChatRoom;
}
interface metadata {
  room_id: string | null;
  sent_by: string | null;
}
interface notifications {
  id: number;
  metadata: metadata;
  notification_message: string;
  notification_type: string;
  sent_at: string;
  title: string;
  user_id: string;
}
type ChatRoomsResponse = UserChatRoom[];

interface AuthState {
  user: user | null;
  AllowedTrainingModels: string;
  loading: boolean;
  error: string | null;
  userStatus: string;
  FeedbackCounts: FeedbackCounts;
  Querycount: number;
  AuthenticityScore: number;
  chatrooms: ChatRoomsResponse;
  isDarkMode: boolean;
  Contributions_user_id_fkey: Contributions_user_id_fkey[];
  currTab: string;
  notificationcount: number | 0;
  notifications: notifications[];
  isLoggedIn: boolean;
  isLoggingOut: boolean;
  isCleaning: boolean;
  variant: string;
}
interface ActionPayload {
  action_type: string;
  room_id: string;
  requested_user_id: string;
  room_name: string;
  admin_id: string;
}
const initialState: AuthState = {
  user: {
    id: "",
    username: "",
    email: "",
    isVerified: false,
    Contributions_user_id_fkey: [],
    created_at: "",
    IsPremiumUser: false,
    AllowedTrainingModels: "YES",
  },
  variant: "stacked-microtype",
  AllowedTrainingModels: "YES",
  loading: false,
  error: null,
  isDarkMode: false,
  userStatus: "idle",
  Querycount: 0,
  FeedbackCounts: { upvote: 0, downvote: 0, partial_upvotes: 0 },
  AuthenticityScore: 0,
  chatrooms: [],
  Contributions_user_id_fkey: [],
  currTab: "Home",
  notificationcount: 0,
  notifications: [],
  isCleaning: false,
  isLoggedIn: false,
  isLoggingOut: false,
};

// Fixed GetUserDocs thunk with proper typing
export const GetUserDashboardData = createAsyncThunk<AuthState, void>(
  "user/getDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BaseApiUrl}/api/user/account-details`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (err: any) {
      if (err.response && err.response.data) {
        const serverMessage =
          err.response.data.message || err.response.data.error;
        if (serverMessage) return rejectWithValue(serverMessage);
      }

      if (err.request) {
        return rejectWithValue(
          "Connection_Lost: Unable to reach AntiNode servers."
        );
      }

      return rejectWithValue(
        err.message || "An unexpected system fault occurred."
      );
    }
  }
);

export const AcceptOrRejectRequest = createAsyncThunk<any, ActionPayload>(
  "request/actions",
  async (
    { action_type, requested_user_id, room_id, room_name, admin_id },
    { rejectWithValue }
  ) => {
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");
      const response = await axios.post(
        `${BaseApiUrl}/api/user/requests/${action_type}/${requested_user_id}/${room_id}/${room_name}/${admin_id}`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${AuthToken}`,
          },
        }
      );
      return response.data;
    } catch (err: any) {
      if (err.response && err.response.data) {
        const serverMessage =
          err.response.data.message || err.response.data.error;
        if (serverMessage) return rejectWithValue(serverMessage);
      }

      if (err.request) {
        return rejectWithValue(
          "Connection_Lost: Unable to reach AntiNode servers."
        );
      }

      return rejectWithValue(
        err.message || "An unexpected system fault occurred."
      );
    }
  }
);

export const DeleteNotification = createAsyncThunk(
  "delete/notification",
  async (notification_id, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");
      const response = await axios.put(
        `${BaseApiUrl}/api/user/delete/notification/${notification_id}`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${AuthToken}`,
          },
        }
      );
      return response.data;
    } catch (err: any) {
      if (err.response && err.response.data) {
        const serverMessage =
          err.response.data.message || err.response.data.error;
        if (serverMessage) return rejectWithValue(serverMessage);
      }

      if (err.request) {
        return rejectWithValue(
          "Connection_Lost: Unable to reach AntiNode servers."
        );
      }

      return rejectWithValue(
        err.message || "An unexpected system fault occurred."
      );
    }
  }
);

export const UpdatePreference = createAsyncThunk<any, string>(
  "updatevalue/preference",
  async (pref, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");
      const response = await axios.put(
        `${BaseApiUrl}/api/user/update-preference`,
        { value: pref },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${AuthToken}`,
          },
        }
      );
      return response.data;
    } catch (err: any) {
      if (err.response && err.response.data) {
        const serverMessage =
          err.response.data.message || err.response.data.error;
        if (serverMessage) return rejectWithValue(serverMessage);
      }

      if (err.request) {
        return rejectWithValue(
          "Connection_Lost: Unable to reach AntiNode servers."
        );
      }

      return rejectWithValue(
        err.message || "An unexpected system fault occurred."
      );
    }
  }
);

export const LogoutUser = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BaseApiUrl}/api/user/session-logout`,
        {},
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (err: any) {
      if (err.response && err.response.data) {
        const serverMessage =
          err.response.data.message || err.response.data.error;
        if (serverMessage) return rejectWithValue(serverMessage);
      }

      if (err.request) {
        return rejectWithValue(
          "Connection_Lost: Unable to reach AntiNode servers."
        );
      }

      return rejectWithValue(
        err.message || "An unexpected system fault occurred."
      );
    }
  }
);
export const SetCookies = createAsyncThunk(
  "update/cookies",
  async (newToken, { rejectWithValue }) => {
    try {
      // const AuthToken = localStorage.getItem(
      //   "AntiNode_eta_six_version1_AuthToken"
      // );
      const response = await axios.post(
        `${BaseApiUrl}/api/user/refreshSession/`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        }
      );
      return response.data;
    } catch (err: any) {
      if (err.response && err.response.data) {
        const serverMessage =
          err.response.data.message || err.response.data.error;
        if (serverMessage) return rejectWithValue(serverMessage);
      }

      if (err.request) {
        return rejectWithValue(
          "Connection_Lost: Unable to reach AntiNode servers."
        );
      }

      return rejectWithValue(
        err.message || "An unexpected system fault occurred."
      );
    }
  }
);
//updating the user preference in the db

// opening a local indexdb insteance for caching
export const StoreInIndexDb = () => {
  const request = window.indexedDB.open("AntiNodeLocalCache", 1);

  return request;
};
const DB_NAME = "AntiNodeLocalCache";
const STORE_NAME = "userinfo";
const DB_VERSION = 1;
const USER_KEY = "currentUser";
//storing the user data recieved from the server in the local cache
function getDbConnection() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // We use an "out-of-line" key approach, meaning we supply the key later.
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onerror = (event: any) => reject(event.target.error);
    request.onblocked = () => reject(new Error("Database connection blocked."));
  });
}

// store the user info in the local index db for caching
export async function StoreLocalCache(data: any) {
  try {
    const db: any = await getDbConnection();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const objectStore = transaction.objectStore(STORE_NAME);

      // We explicitly provide the key as the second argument to .put()
      const putRequest = objectStore.put(
        {
          username: data.username,
          email: data.email,
          created_at: data.created_at,
          isVerified: data.isVerified,
          PaymentStatus: data.IsPremiumUser,
          contributions: data.Contributions_user_id_fkey,
        },
        USER_KEY
      );

      putRequest.onsuccess = () =>
        resolve({ message: "User data cached successfully." });
      putRequest.onerror = (e: any) =>
        reject({
          message: "Failed to cache user data.",
          error: e.target.error,
        });
      transaction.onerror = (e: any) =>
        reject({ message: "Transaction error.", error: e.target.error });
    });
  } catch (error) {
    throw error;
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    UpdateFromLocalCache: (state, action) => {
      // Only update existing user fields when a user object exists in state

      if (action.payload && state.user) {
        state.user.username = action.payload.username;
        state.user.email = action.payload.email;
        state.user.created_at = action.payload.created_at;

        state.user.isVerified = action.payload.isVerified;
        state.user.IsPremiumUser = action.payload.PaymentStatus;
        state.user.Contributions_user_id_fkey = [
          ...action.payload.contributions,
        ];
        state.Contributions_user_id_fkey = [...action.payload.contributions];
      }
    },
    DeleteFromDocs: (_state, _action) => {},
    toggleTheme: (state) => {
      // console.log(state.isDarkMode)
      state.isDarkMode = !state.isDarkMode;
    },
    setDocs: (state, action) => {
      state.Contributions_user_id_fkey.push(action.payload);
    },
    setTheme: (state, action) => {
      state.isDarkMode = action.payload;
    },
    setCurrTab: (state, action) => {
      state.currTab = action.payload;
    },
    setVariant: (state, action) => {
      state.variant = action.payload;
    },
    SetNotifications: (state, action) => {
      // console.log(action.payload)
      state.notifications = state.notifications.filter(
        (elemen) => elemen.id !== action.payload
      );
      state.notificationcount -= 1;
    },
    setNotificationCount: (state) => {
      if (state.notificationcount > 0) {
        state.notificationcount -= 1;
      }
    },
    togglePreference: (state, action) => {
      // console.log("Toggedled the preference", _action.payload);
      state.AllowedTrainingModels = action.payload;
    },
    UpdatedPreference: (state, action) => {
      if (action.payload.value === "YES") {
        state.AllowedTrainingModels = "YES";
      } else {
        state.AllowedTrainingModels = "NO";
      }
    },
    NewUserNotification: (state, action) => {
      // console.log(action.payload, 'this has been envoked')
      const notificationExists = (
        notificationsArray: any,
        newNotification: any
      ) => {
        return notificationsArray.some(
          (existingNotification: any) =>
            existingNotification.id === newNotification.id
        );
      };
      if (action.payload.length) {
        action.payload.forEach((newNotification: any) => {
          if (!notificationExists(state.notifications, newNotification)) {
            state.notifications.push(newNotification);
            state.notificationcount += 1;
          }
        });
      } else {
        state.notifications.push(action.payload);
        state.notificationcount += 1;
      }
    },

    setIsLogin: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    setUseStatus: (state, action) => {
      state.userStatus = action.payload;
    },
    SetQueryCount: (state) => {
      state.Querycount += 1;
    },
  },
  extraReducers: (builder) => {
    builder

      // getting user account details
      .addCase(GetUserDashboardData.pending, (state) => {
        state.userStatus = "pending";
      })
      .addCase(GetUserDashboardData.fulfilled, (state, action) => {
        // console.log(action.payload)
        if (action.payload?.user) {
          // Assign the user object and its nested properties
          state.user = action.payload.user;
          state.user.Contributions_user_id_fkey =
            action.payload.Contributions_user_id_fkey;
          state.Querycount = action.payload.Querycount;
          state.FeedbackCounts = action.payload.FeedbackCounts;
          state.chatrooms = [...state.chatrooms, ...action.payload.chatrooms];
          state.notificationcount = action.payload.notificationcount;
          state.notifications = action.payload.notifications;

          state.AllowedTrainingModels =
            action.payload.user.AllowedTrainingModels;
        }
        state.userStatus = "idle";
      })
      .addCase(GetUserDashboardData.rejected, (state) => {
        state.userStatus = "idle";
      })
      // notificaiton handle
      .addCase(AcceptOrRejectRequest.pending, (state) => {
        state.isCleaning = true;
      })
      .addCase(AcceptOrRejectRequest.rejected, (state) => {
        state.isCleaning = false;
      })
      .addCase(AcceptOrRejectRequest.fulfilled, (state) => {
        state.isCleaning = false;
      })
      // logging out of the app
      .addCase(LogoutUser.pending, (state) => {
        state.isLoggingOut = true;
      })
      .addCase(LogoutUser.rejected, (state) => {
        state.isLoggingOut = false;
      })
      .addCase(LogoutUser.fulfilled, (state, action) => {
        if (action.payload.message === "Session revoked") {
          state.isLoggedIn = false;
        }
        state.isLoggingOut = false;
      });
  },
});

export const {
  toggleTheme,
  setTheme,
  setCurrTab,
  SetNotifications,
  setNotificationCount,
  NewUserNotification,
  setIsLogin,
  setUseStatus,
  SetQueryCount,
  UpdateFromLocalCache,
  setDocs,
  DeleteFromDocs,
  togglePreference,
  UpdatedPreference,
  setVariant,
} = authSlice.actions;
export default authSlice.reducer;
