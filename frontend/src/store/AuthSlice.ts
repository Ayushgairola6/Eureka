import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from './reduxstore';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL

// Document type should be separate from auth state
interface Contributions_user_id_fkey {
  id: string;
  feedback: string;
  created_at: string;
  document_id: string;
}



interface user {
  id: string;
  username: string;
  email: string;
  Contributions_user_id_fkey: Contributions_user_id_fkey[];
  created_at: string;
}

interface FeedbackCounts {
  upvotes: number 
  downvotes: number 
  partial_upvotes: number
}

interface AuthState {
  user: user | null;
  loading: boolean;
  error: string | null;
  userStatus: boolean | null;
  FeedbackCounts: FeedbackCounts ;
  Querycount: number;
  AuthenticityScore:number;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  userStatus: false,
  Querycount: 0,
  FeedbackCounts: {upvotes:0,downvotes:0,partial_upvotes:0},
  AuthenticityScore:0,
};

// Fixed GetUserDocs thunk with proper typing
export const GetUserDashboardData = createAsyncThunk<AuthState, void>(
  'user/getDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
      if (!AuthToken) {
        return rejectWithValue("Authentication token not found.");
      }

      const response = await axios.get(`${BaseApiUrl}/api/user/account-details`, {
        withCredentials: true,
        headers: {
          "Authorization": `Bearer ${AuthToken}`
        }
      });

      return response.data;

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to fetch dashboard data'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {

  },
  extraReducers: (builder) => {
    builder

      // getting user account details
      .addCase(GetUserDashboardData.pending, (state) => {
        state.userStatus = true;

      })
      .addCase(GetUserDashboardData.fulfilled, (state, action) => {

        // console.log(action.payload)
        if (action.payload?.user) {
          // Assign the user object and its nested properties
          state.user = action.payload.user;
          state.Querycount = action.payload.Querycount;
          state.FeedbackCounts = action.payload.FeedbackCounts;
          
        }
        state.userStatus = false;
      })
      .addCase(GetUserDashboardData.rejected, (state) => {
        state.userStatus = false;
      })
  },
});

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectDocumentsLoading = (state: RootState) => state.auth.loading;

export default authSlice.reducer;