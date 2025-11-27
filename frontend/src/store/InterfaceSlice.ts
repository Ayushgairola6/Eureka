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
}
interface messageInt {
  isComplete: boolean;
  content: string;
}
interface ChatsInterface {
  id: string;
  sent_by: string;
  message: messageInt;
  sent_at: string;
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
  queryType: "",
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
};

// Async Thunks
export const UploadDocuments = createAsyncThunk<any, FormData>(
  "upload/docs",
  async (formData, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
      const response = await axios.post(
        `${BaseApiUrl}/api/upload-pdf`,
        formData,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${AuthToken}`,
          },
          onUploadProgress: (_e: any) => {
            // console.log(e, "this is the upload progress");
          },
        }
      );
      return response.data;
    } catch (err) {
      // console.error("Error fetching dashboard data:", err);
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to fetch dashboard data"
      );
    }
  }
);

export const QueryAIQuestions = createAsyncThunk<any, any>(
  "ask/queryAI",
  async (data, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
      const response = await axios.post(`${BaseApiUrl}/api/ask-docs`, data, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${AuthToken}`,
        },
      });
      return response.data;
    } catch (err) {
      // console.error("Error fetching dashboard data:", err);
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to fetch dashboard data"
      );
    }
  }
);

// deelting a document
export const DeleteDocuments = createAsyncThunk<string, any>(
  "delete/documents",
  async (document_id, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");

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
    } catch (error: any) {
      console.error(`Error file deleting document`);
      return rejectWithValue(
        error?.response.data.message ||
        "An error occured while processing your request"
      );
    }
  }
);
export const QueryPrivateDocuments = createAsyncThunk<any, any>(
  "private-doc/queryAI",
  async (data, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
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
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to fetch dashboard data"
      );
    }
  }
);

export const AuthenticityResponseHandler = createAsyncThunk<object, any>(
  "authenticity/verify",
  async (data, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
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
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to fetch dashboard data"
      );
    }
  }
);
export const WebSearchHandler = createAsyncThunk<any, any>(
  "query/web",
  async ({ question, MessageId, userMessageId }, { rejectWithValue }) => {
    const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");

    try {
      const response = await axios.post(
        `${BaseApiUrl}/api/query/web-search`,
        { question, MessageId, userMessageId },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${AuthToken}`,
          },
        }
      );
      return response.data;
    } catch (err: any) {
      console.error("Error fetching response :", err.response.data.message);
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to generate a response"
      );
    }
  }
);

export const GetCachedSessionHistory = createAsyncThunk(
  "get/sessioncache",
  async (_, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");

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
    } catch (error: any) {
      rejectWithValue(error?.response?.data.message || "Something went wrong");
    }
  }
);

export const ProcessSynthesis = createAsyncThunk<any, any>('synthesis/reques',
  async (data, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
      const response = await axios.post(`${BaseApiUrl}/api/method/synthesis`, data, {
        withCredentials: true,
        headers: {
          "Authorization": `Bearer ${AuthToken}`
        }
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message)
    }
  })
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
        state.docUsed = [...state.docUsed, ...action.payload.docUsed];
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
      .addCase(WebSearchHandler.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.favicon && action.payload.favicon.length > 0) {
          state.favicon = [...state.favicon, ...action.payload.favicon];
        }
        // state.docUsed = action.payload
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
      .addCase(ProcessSynthesis.pending,(state,action)=>{
        state.loading=true
      }).addCase(ProcessSynthesis.rejected,(state,action)=>{
        state.loading=false
      }).addCase(ProcessSynthesis.fulfilled,(state,action)=>{
        state.loading=false
      })
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
} = interfaceSlice.actions;

export default interfaceSlice.reducer;
