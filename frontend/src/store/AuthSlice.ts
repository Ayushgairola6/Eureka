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
}

interface FeedbackCounts {
  upvotes: number;
  downvotes: number;
  partial_upvotes: number;
}
interface ChatRoom {
  room_id: string | null;
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
}
interface ActionPayload {
  action_type: string;
  room_id: string;
  requested_user_id: string;
  room_name: string;
  admin_id: string;
}
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isDarkMode: false,
  userStatus: "idle",
  Querycount: 0,
  FeedbackCounts: { upvotes: 0, downvotes: 0, partial_upvotes: 0 },
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
      const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
      if (!AuthToken) {
        return rejectWithValue("Authentication token not found.");
      }

      const response = await axios.get(
        `${BaseApiUrl}/api/user/account-details`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${AuthToken}`,
          },
        }
      );

      return response.data;
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to fetch dashboard data"
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
      const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
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
      // console.log(response.data);
      return response.data;
    } catch (err) {
      console.error("Error managing the notification:", err);
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to fetch dashboard data"
      );
    }
  }
);

export const DeleteNotification = createAsyncThunk(
  "delete/notification",
  async (notification_id, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
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
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to fetch Account details"
      );
    }
  }
);
export const LogoutUser = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
      const response = await axios.post(
        `${BaseApiUrl}/api/user/session-logout`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${AuthToken}`,
          },
        }
      );
      if (response.data.message === "Session revoked") {
        localStorage.removeItem("Eureka_six_eta_v1_Authtoken");
        document.cookie =
          "Eureka_eta_six_version1_AuthToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        return response.data;
      }
      console.log(response.data);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to logout"
      );
    }
  }
);
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      // console.log(state.isDarkMode)
      state.isDarkMode = !state.isDarkMode;
    },
    setTheme: (state, action) => {
      state.isDarkMode = action.payload;
    },
    setCurrTab: (state, action) => {
      state.currTab = action.payload;
    },
    SetNotifications: (state, action) => {
      // console.log(action.payload)
      state.notifications = state.notifications.filter(
        (elemen) => elemen.id !== action.payload
      );
      state.notificationcount -= 1;
    },
    setNotificationCount: (state) => {
      state.notificationcount = state.notificationcount - 1;
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
          state.chatrooms = action.payload.chatrooms;
          state.notificationcount = action.payload.notificationcount;
          state.notifications = action.payload.notifications;
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
} = authSlice.actions;
export default authSlice.reducer;
