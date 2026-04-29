import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;
import axios from "axios";

interface visualizer {
  title: string;
  reasoning: string;
  chart_type: string;
  labels: any[];
  datasets: any[];
  MessageId: string;
}
interface VisualState {
  VisualizationData: visualizer[];
  isVisualizing: boolean;
  showInsights: boolean;
}
// sends a request for visualization
const intialState: VisualState = {
  VisualizationData: [],
  isVisualizing: false,
  showInsights: false,
};
export const HandleVisualizationRequest = createAsyncThunk<any, any>(
  "data/visualize",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BaseApiUrl}/api/visualizer`, data, {
        withCredentials: true,
      });
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
export const VisualizerSlice = createSlice({
  name: "visualizer",
  initialState: intialState,
  reducers: {
    toggleInsights: (state, action) => {
      state.showInsights = action.payload;
    },
    setIsVisualizing: (state, action) => {
      state.isVisualizing = action.payload;
    },
  },
  extraReducers: (builder) => {
    // handle pending, fulfilled, and rejected states of the async thunk
    builder
      .addCase(HandleVisualizationRequest.pending, (state) => {
        state.isVisualizing = true;
      })
      .addCase(HandleVisualizationRequest.fulfilled, (state, action) => {
        state.VisualizationData.push(action.payload.results);
        state.isVisualizing = false;
      })
      .addCase(HandleVisualizationRequest.rejected, (state) => {
        state.isVisualizing = false;
      });
  },
});

export default VisualizerSlice.reducer;
export const { toggleInsights, setIsVisualizing } = VisualizerSlice.actions;
