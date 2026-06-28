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
  artifacts: any[];
  fetching_artifacts: boolean;
  isRecording: boolean;
  isGenerating: boolean;
  audioFile: any;
}
// sends a request for visualization
const intialState: VisualState = {
  VisualizationData: [],
  isVisualizing: false,
  showInsights: false,
  artifacts: [],
  fetching_artifacts: false,
  isRecording: false,
  isGenerating: false,
  audioFile: null,
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

export const FetchArtifacts = createAsyncThunk(
  "data/fetchArtifacts",
  async (timestamp, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BaseApiUrl}/api/artifacts?timestamp=${timestamp}`,
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

// generate text from speech
export const GenerateFromAudio = createAsyncThunk<any, any>(
  "generate/audio",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BaseApiUrl}/api/stt`, data, {
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

//generate speech
export const GenerateSpeech = createAsyncThunk<any, any>(
  "generate/speech",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BaseApiUrl}/api/tts`, data, {
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
    setRecording: (state, action) => {
      state.isRecording = action.payload;
    },
    setAudioFile: (state, action) => {
      state.audioFile = action.payload;
    },
  },
  extraReducers: (builder) => {
    // handle pending, fulfilled, and rejected states of the async thunk
    builder
      .addCase(HandleVisualizationRequest.pending, (state) => {
        state.isVisualizing = true;
      })
      .addCase(HandleVisualizationRequest.fulfilled, (state, action) => {
        console.log("Visualization data received:", action.payload);
        if (!action.payload?.results) return;
        state.VisualizationData.push(action.payload?.results);
        state.isVisualizing = false;
      })
      .addCase(HandleVisualizationRequest.rejected, (state) => {
        state.isVisualizing = false;
      })

      // artifacts fetchign

      .addCase(FetchArtifacts.pending, (state) => {
        state.fetching_artifacts = true;
      })
      .addCase(FetchArtifacts.fulfilled, (state, action) => {
        state.fetching_artifacts = false;

        state.artifacts = [state.artifacts, ...action.payload.artifacts].flat();
      })
      .addCase(FetchArtifacts.rejected, (state) => {
        state.fetching_artifacts = false;
      })

      // send stt request
      .addCase(GenerateFromAudio.pending, (state) => {
        state.isGenerating = true;
      })
      .addCase(GenerateFromAudio.rejected, (state) => {
        state.isGenerating = false;
      })
      .addCase(GenerateFromAudio.fulfilled, (state) => {
        state.isGenerating = false;
      })
      /// text to speech request
      .addCase(GenerateSpeech.pending, (state) => {
        state.isGenerating = true;
      })
      .addCase(GenerateSpeech.rejected, (state) => {
        state.isGenerating = false;
      })
      .addCase(GenerateSpeech.fulfilled, (state, action) => {
        state.isGenerating = false;
        const buffer = action.payload.buffer;

        if (!buffer) return;
        const binaryString = atob(buffer);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "audio/wav" });
        // dispatch(setAudioFile(blob));
        state.audioFile = blob;
        // state.audioFile = action.payload?.buffer;
      });
  },
});

export default VisualizerSlice.reducer;
export const { toggleInsights, setIsVisualizing, setRecording, setAudioFile } =
  VisualizerSlice.actions;
