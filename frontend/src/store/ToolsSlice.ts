import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;

interface ToolsState {
  driveConnected: boolean;
  connectingTool: boolean;
}

const initialState: ToolsState = {
  driveConnected: false,
  connectingTool: false,
};

// checks whether the user has connected their drive
export const CheckDriveConnectorState = createAsyncThunk(
  "check/drive_connector",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BaseApiUrl}/api/connector-status`, {
        withCredentials: true,
      });
      console.log(response.data, "this is the connector status data");
      return response.data;
    } catch (err: any) {
      if (err.response && err.response.data) {
        const { message, error, action } = err.response.data;
        const serverMessage = message || error;
        const status = err.response.status;

        // rate limit — specific message regardless of server response
        if (status === 429) {
          return rejectWithValue(
            "You've hit the rate limit. Please wait a moment."
          );
        }

        // session expired — trigger logout
        if (status === 401) {
          return rejectWithValue("Session_Expired: Please log in again.");
        }

        // server knows what happened — trust its message
        if (serverMessage) {
          return rejectWithValue(
            action
              ? { message: serverMessage, action } // pass action through for Drive UI
              : serverMessage
          );
        }

        // server returned error status but no message
        if (status >= 500) {
          return rejectWithValue(
            "AntiNode servers encountered an error. Please try again."
          );
        }
      }

      // no response at all — network issue
      if (err.request) {
        return rejectWithValue(
          "Connection_Lost: Unable to reach AntiNode servers."
        );
      }

      // something else entirely
      return rejectWithValue(
        err.message || "An unexpected system fault occurred."
      );
    }
  }
);

export const ConnectDriveRequest = createAsyncThunk(
  "drive/connect",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BaseApiUrl}/api/drive-connect`,
        {},
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (err: any) {
      if (err.response && err.response.data) {
        const { message, error, action } = err.response.data;
        const serverMessage = message || error;
        const status = err.response.status;

        // rate limit — specific message regardless of server response
        if (status === 429) {
          return rejectWithValue(
            "You've hit the rate limit. Please wait a moment."
          );
        }

        // session expired — trigger logout
        if (status === 401) {
          return rejectWithValue("Session_Expired: Please log in again.");
        }

        // server knows what happened — trust its message
        if (serverMessage) {
          return rejectWithValue(
            action
              ? { message: serverMessage, action } // pass action through for Drive UI
              : serverMessage
          );
        }

        // server returned error status but no message
        if (status >= 500) {
          return rejectWithValue(
            "AntiNode servers encountered an error. Please try again."
          );
        }
      }

      // no response at all — network issue
      if (err.request) {
        return rejectWithValue(
          "Connection_Lost: Unable to reach AntiNode servers."
        );
      }

      // something else entirely
      return rejectWithValue(
        err.message || "An unexpected system fault occurred."
      );
    }
  }
);
const ToolsSlice = createSlice({
  name: "tools",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // drive connection case
      .addCase(ConnectDriveRequest.rejected, (state) => {
        state.driveConnected = false;
        state.connectingTool = false;
      })
      .addCase(ConnectDriveRequest.pending, (state) => {
        state.driveConnected = false;
        state.connectingTool = true;
      })
      .addCase(ConnectDriveRequest.fulfilled, (state, action) => {
        if (action.payload?.action === "drive_connected") {
          state.driveConnected = true;
          state.connectingTool = false;
        }
      })
      //drive connection check case
      .addCase(CheckDriveConnectorState.rejected, (state) => {
        state.driveConnected = false;
      })
      .addCase(CheckDriveConnectorState.pending, (state) => {
        state.driveConnected = false;
      })
      .addCase(CheckDriveConnectorState.fulfilled, (state, action) => {
        if (action.payload?.action === "drive_connected") {
          state.driveConnected = true;
        }
      });
  },
});

export const {} = ToolsSlice.actions;
export default ToolsSlice.reducer;
