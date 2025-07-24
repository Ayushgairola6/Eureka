import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './reduxstore';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Document type should be separate from auth state
export interface Document {
  id: string;
  feedback: string;
  url: string;
  created_at: string;
  document_id:string;

}

interface User {
  id: string;
  username: string;
  email: string;


}

interface AuthState {
  user: User | null; // added user to the state
  token: string | null;
  isLoggedIn: boolean;
  documents: Document[]; // Added documents array to state
  loading: boolean;
  error: string | null;
  userStatus: boolean | null;
}

// now AuthState is the initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoggedIn: false,
  documents: [],
  loading: false,
  error: null,
  userStatus: false
};

// Fixed GetUserDocs thunk with proper typing
export const GetUserDocs = createAsyncThunk<Document[], void>(
  'auth/getDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("Eureka_six_eta_v1_Auth_token");

      const response = await axios.get("http://localhost:1000/api/user/documents", {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.message === "No docs found") {
        return [];
      }
      console.log(response.data);
      return response.data.data as Document[]; 
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to fetch documents'
      );
    }
  }
);


export const GetUserDetails = createAsyncThunk<User, void>(
  'user/accountdata',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("Eureka_six_eta_v1_Auth_token");
      const response = await axios.get('http://localhost:1000/api/user/account-details', {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.data.message === "User data found") {
        return response.data.user[0]
      } else {
        return "User data not found"
      }
    } catch (err) {
      // console.log(err);

      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to get user details"
      )
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.documents = []; // Clear documents on logout
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetUserDocs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetUserDocs.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(GetUserDocs.rejected, (state) => {
        state.loading = false;
        state.error = 'Document fetch failed';
      })
      // getting user account details
      .addCase(GetUserDetails.pending, (state) => {
        state.userStatus = true;

      })
      .addCase(GetUserDetails.fulfilled, (state, action) => {

        state.user = action.payload;

        state.userStatus = false;
      })
      .addCase(GetUserDetails.rejected, (state) => {
        state.userStatus = false;
      })
  },
});

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectDocuments = (state: RootState) => state.auth.documents;
export const selectDocumentsLoading = (state: RootState) => state.auth.loading;

export default authSlice.reducer;