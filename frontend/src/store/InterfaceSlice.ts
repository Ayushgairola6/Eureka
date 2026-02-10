import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;

interface DocVote {
  doc_id: string;
  upvotes: number;
  downvotes: number;
  partial_upvotes: number;
}

interface DocUsed {
  MessageId: string;
  docs: DocVote[];
}

interface favicon {
  MessageId: string;
  icon: any[];
  url: string[];
}
interface messageInt {
  isComplete: boolean;
  content: string;
}
interface ChatsInterface {
  id: string | number;
  sent_by: string;
  message: messageInt;
  sent_at: string;
}
interface currenttheme {
  id: string;
  name: string;
  color: string;
  user: string;
  ai: string;
}
interface InterfaceState {
  question: string;
  answer: string;
  loading: boolean;
  isVisible: boolean;
  category: string;
  subCategory: string;
  visibility: string;
  showSubcategory: boolean;
  shhowUserForm: boolean;
  showDocs: boolean;
  privateResponse: string;
  likeness: string;
  suggestion: string;
  shwoOptions: boolean;
  queryType: string;
  showType: boolean;
  docUsed: DocUsed[];
  sendingFeedback: boolean;
  Chats: ChatsInterface[];
  favicon: favicon[];
  selectedDoc: string;
  uploading: boolean;
  deleting: boolean;
  NeedToRefresh: boolean;
  SynthesisDocuments: string[];
  uploadStatus: string;
  fetchingSessionHistory: boolean;
  ResponseStatus: any[];
  CurrentTheme: currenttheme;
  search_depth: string;
}

const initialState: InterfaceState = {
  question: "",
  answer: "",
  loading: false,
  isVisible: false,
  category: "",
  subCategory: "",
  visibility: "Public",
  showSubcategory: false,
  shhowUserForm: false,
  showDocs: false,
  privateResponse: "",
  likeness: "",
  suggestion: "",
  shwoOptions: false,
  showType: false,
  queryType: "Web Search",
  docUsed: [],
  sendingFeedback: false,
  Chats: [],
  favicon: [
    // {
    //   MessageId: "none",
    //   icon: [
    //     "https://images.unsplash.com/photo-1748686856746-fc758ac9b4c7?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    //   ],
    // },
  ],
  selectedDoc: "",
  uploading: false,
  deleting: false,
  NeedToRefresh: false,
  SynthesisDocuments: [],
  uploadStatus: "Processing",
  fetchingSessionHistory: false,
  ResponseStatus: [],
  CurrentTheme: {
    id: "void-prime",
    name: "Void Prime",
    color: "#000000",
    // Absolute contrast. High-end Swiss style.
    user: "bg-zinc-950 text-white dark:bg-white dark:text-black rounded-none border-l-[1px] border-zinc-500 pl-4 py-1 my-4 uppercase tracking-widest text-[10px] font-bold",
    ai: "bg-transparent text-zinc-800 dark:text-zinc-200 border-t border-zinc-100 dark:border-zinc-900/50 pt-6 pb-12 leading-[1.8] tracking-tight",
  },
  search_depth: "surface_web",
};

// Async Thunks
export const UploadDocuments = createAsyncThunk<any, FormData>(
  "upload/docs",
  async (formData, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");
      const response = await axios.post(
        `${BaseApiUrl}/api/upload-pdf`,
        formData,
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

export const GetSessionHistory = createAsyncThunk<any, any>(
  "user/sessio-history",
  async (lastMessageTime, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");

      const response = await axios.post(
        `${BaseApiUrl}/api/user/session-history`,
        { lastMessageTime },
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
export const QueryAIQuestions = createAsyncThunk<any, any>(
  "ask/queryAI",
  async (data, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");
      const response = await axios.post(`${BaseApiUrl}/api/ask-docs`, data, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${AuthToken}`,
        },
      });
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

// deelting a document
export const DeleteDocuments = createAsyncThunk<string, any>(
  "delete/documents",
  async (document_id, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");

      const response = await axios.delete(
        `${BaseApiUrl}/api/user/private-docs/delete/?document_id=${document_id}`,
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
export const QueryPrivateDocuments = createAsyncThunk<any, any>(
  "private-doc/queryAI",
  async (data, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");
      const response = await axios.post(
        `${BaseApiUrl}/api/privateDocs/ask-docs`,
        data,
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

export const AuthenticityResponseHandler = createAsyncThunk<object, any>(
  "authenticity/verify",
  async (data, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");
      const response = await axios.post(
        `${BaseApiUrl}/api/doc/authenticity`,
        data,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${AuthToken}`,
          },
        }
      );
      // console.log(response.data);
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
export const WebSearchHandler = createAsyncThunk<any, any>(
  "query/web",
  async (
    { question, MessageId, userMessageId, web_search_depth },
    { rejectWithValue }
  ) => {
    const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");

    try {
      const response = await axios.post(
        `${BaseApiUrl}/api/query/web-search`,
        { question, MessageId, userMessageId, web_search_depth },
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

export const GetCachedSessionHistory = createAsyncThunk(
  "get/sessioncache",
  async (_, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");

      const response = await axios.get(
        `${BaseApiUrl}/api/user/session-history/cache=true`,
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

export const ProcessSynthesis = createAsyncThunk<any, any>(
  "synthesis/request",
  async (data, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");
      const response = await axios.post(
        `${BaseApiUrl}/api/method/synthesis`,
        data,
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
const interfaceSlice = createSlice({
  name: "interface",
  initialState,
  reducers: {
    MimicSSE: (state, action) => {
      const { id, delta } = action.payload;
      const msg = state.Chats.find((data) => data.id === id);

      let i = 0;

      if (msg) {
        while (i < delta.length) {
          msg.message.content = (msg.message.content || "") + delta[i];
          i++;
        }
      }
    },
    UpdateChats: (state, action) => {
      const hasIt = state.Chats.some((elem) => elem.id === action.payload.id);
      if (!hasIt) {
        state.Chats.push(action.payload);
      }
    },
    finalizeMessage: (state, action) => {
      const { id, data } = action.payload;
      // find the message who we are finalizing with SSE
      const msg = state.Chats.find((data) => data.id === id);
      if (data && msg) {
        msg?.message.isComplete === true;
        msg.message.content = data;
      }
      if (msg) {
        msg.message.isComplete = true;
      }
    },
    updateFavicon: (state, action) => {
      state.favicon.push(action.payload);
    },
    setSelectedDoc: (state, action) => {
      state.selectedDoc = action.payload;
    },
    SetSynthesisDocuments: (state, action) => {
      const NewId = action.payload;
      // console.log("intiaed documents selection", NewId);
      if (!state.SynthesisDocuments.includes(NewId)) {
        state.SynthesisDocuments.push(action.payload);
      } else {
        const NewArray = state.SynthesisDocuments.filter((li) => li !== NewId);
        state.SynthesisDocuments = [...NewArray];
      }
    },
    setCurrenTheme: (state, action) => {
      state.CurrentTheme = action.payload;
    },
    EmptyTheSynthesisArray: (state) => {
      state.SynthesisDocuments = [];
    },
    UpdateMessage: (state, action) => {
      const { id, delta } = action.payload;
      const msg = state.Chats.find((data) => data.id === id);

      if (msg) {
        msg.message.content = (msg.message.content || "") + delta; // append instead of replace
      }
    },
    setNeedToRefresh: (state, action) => {
      state.NeedToRefresh = action.payload;
    },
    UpdateResponseStatus: (state, action) => {
      action.payload.length > 0 &&
        action.payload.forEach((message: any) => {
          const obj = {
            id: message.id,
            statue: "Feedback recorded",
          };
          state.ResponseStatus.push(obj); //updates the array with old messages
        });
    },
    ResponseLikeStatus: (state, action) => {
      //find the id of the element and update its staus
      const indexofmessage = state.ResponseStatus.findIndex(
        (elem) => elem.id === action.payload.id
      );
      const data = {
        id: action.payload.id,
        status: action.payload.status,
      };
      state.ResponseStatus.splice(indexofmessage, 1); //delete it
      state.ResponseStatus.push(data);
    },
    setQuestion: (state, action) => {
      state.question = action.payload;
    },

    setAnswer: (state, action) => {
      state.answer = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setIsVisible: (state, action) => {
      state.isVisible = action.payload;
    },
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    setVisibility: (state, action) => {
      state.visibility = action.payload;
    },
    setShowSubcategory: (state, action) => {
      state.showSubcategory = action.payload;
    },
    setShowUserForm: (state, action) => {
      state.shhowUserForm = action.payload;
    },
    setShowDocs: (state, action) => {
      state.showDocs = action.payload;
    },
    setPrivateResponse: (state, action) => {
      state.privateResponse = action.payload;
    },
    setLikeness: (state, action) => {
      state.likeness = action.payload;
    },
    setSuggestion: (state, action) => {
      state.suggestion = action.payload;
    },
    setShowOptions: (state, action) => {
      state.shwoOptions = action.payload;
    },
    setQueryType: (state, action) => {
      state.queryType = action.payload;
    },
    setShowType: (state, action) => {
      state.showType = action.payload;
    },
    setSubCategory: (state, action) => {
      state.subCategory = action.payload;
    },
    setUploadStatus: (state, action) => {
      state.uploadStatus = action.payload;
    },
    UpdateSessionChats: (state, action) => {
      if (action.payload) {
        // Use a Map or Set to prevent duplicate IDs if necessary
        const newChats = action.payload;
        // Overwriting can cause a "flicker" if the source isn't stable.
        // Try spreading the existing state if you want to keep current messages:
        state.Chats = [...state.Chats, ...newChats];
      }
    },
    updatefetchingSessionHistory: (state, action) => {
      state.fetchingSessionHistory = action.payload;
    },
    setSearchDepth: (state, action) => {
      state.search_depth = action.payload;
    },
    likeResponse: (_state, _action) => {},
    resetState: (_state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(UploadDocuments.pending, (state) => {
        state.uploading = true;
      })
      .addCase(UploadDocuments.fulfilled, (state) => {
        state.uploading = false;
      })
      .addCase(UploadDocuments.rejected, (state) => {
        state.uploading = false;
      })

      //ask questions
      .addCase(QueryAIQuestions.pending, (state) => {
        state.loading = true;
      })
      .addCase(QueryAIQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.docUsed.push(action.payload.docUsed);
      })
      .addCase(QueryAIQuestions.rejected, (state) => {
        state.loading = false;
      })

      //query privatedocuments
      .addCase(QueryPrivateDocuments.pending, (state) => {
        state.loading = true;
      })
      .addCase(QueryPrivateDocuments.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.favicon && action.payload.favicon.length > 0) {
          state.favicon = [...action.payload.favicon];
        }
      })
      .addCase(QueryPrivateDocuments.rejected, (state) => {
        state.loading = false;
      })

      //authenticiy handler
      .addCase(AuthenticityResponseHandler.pending, (state) => {
        state.sendingFeedback = true;
      })
      .addCase(AuthenticityResponseHandler.fulfilled, (state) => {
        state.sendingFeedback = false;
        // state.docUsed = action.payload
      })
      .addCase(AuthenticityResponseHandler.rejected, (state) => {
        state.sendingFeedback = false;
      })
      // webSearch
      .addCase(WebSearchHandler.pending, (state) => {
        state.loading = true;
      })
      .addCase(WebSearchHandler.fulfilled, (state, _action) => {
        state.loading = false;
      })
      .addCase(WebSearchHandler.rejected, (state) => {
        state.sendingFeedback = false;
        state.loading = false;
      })
      //deleting a document handler
      .addCase(DeleteDocuments.pending, (state) => {
        state.deleting = true;
      })
      .addCase(DeleteDocuments.rejected, (state) => {
        state.deleting = false;
      })
      .addCase(DeleteDocuments.fulfilled, (state) => {
        state.deleting = false;
        state.NeedToRefresh = true;
      })
      // getting the cached chat history
      .addCase(GetCachedSessionHistory.fulfilled, (state, action) => {
        state.Chats = [...action.payload.data];
      })
      //synthesis process
      .addCase(ProcessSynthesis.pending, (state, _action) => {
        state.loading = true;
      })
      .addCase(ProcessSynthesis.rejected, (state, _action) => {
        state.loading = false;
      })
      .addCase(ProcessSynthesis.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.docUsed) {
          state.docUsed = [...state.docUsed, action.payload.docUsed];
        }
      })
      //fetchigng session data
      .addCase(GetSessionHistory.pending, (state, _action) => {
        state.fetchingSessionHistory = true;
      })
      .addCase(GetSessionHistory.rejected, (state, _action) => {
        state.fetchingSessionHistory = false;
      })
      .addCase(GetSessionHistory.fulfilled, (state, _action) => {
        state.fetchingSessionHistory = false;
      });
  },
});

export const {
  UpdateChats,
  setQuestion,
  setAnswer,
  setLoading,
  setIsVisible,
  setCategory,
  setLikeness,
  setPrivateResponse,
  setQueryType,
  setShowDocs,
  setShowOptions,
  setShowSubcategory,
  setShowType,
  setShowUserForm,
  setSuggestion,
  setVisibility,
  setSubCategory,
  finalizeMessage,
  UpdateMessage,
  MimicSSE,
  setSelectedDoc,
  updateFavicon,
  setNeedToRefresh,
  SetSynthesisDocuments,
  EmptyTheSynthesisArray,
  setUploadStatus,
  UpdateSessionChats,
  updatefetchingSessionHistory,
  ResponseLikeStatus,
  likeResponse,
  UpdateResponseStatus,
  setCurrenTheme,
  setSearchDepth,
} = interfaceSlice.actions;

export default interfaceSlice.reducer;
