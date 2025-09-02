import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;

interface DocUsed {
  uploaded_by: string
  doc_id: []
  upvotes: number
  downvotes: number
  partial_upvotes: number
}

interface InterfaceState {
  question: string
  answer: string
  loading: boolean
  isVisible: boolean
  category: string
  subCategory: string
  visibility: string
  showSubcategory: boolean
  shhowUserForm: boolean
  showDocs: boolean
  privateResponse: string
  likeness: string
  suggestion: string
  shwoOptions: boolean
  queryType: string
  showType: boolean
  docUser: DocUsed[]
}

const initialState: InterfaceState = {
  question: "",
  answer: "",
  loading: false,
  isVisible: false, category: '', subCategory: "", visibility: "Public", showSubcategory: false, shhowUserForm: false, showDocs: false, privateResponse: '', likeness: "", suggestion: "", shwoOptions: false, showType: false, queryType: "", docUser: []
};

// Async Thunks
export const UploadDocuments = createAsyncThunk<any, FormData>(
  'upload/docs',
  async (formData, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
      const response = await axios.post(`${BaseApiUrl}/api/upload-pdf`, formData, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${AuthToken}`
        }
      })
      return response.data;
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to fetch dashboard data'
      );
    }
  }
)


export const QueryAIQuestions = createAsyncThunk<any, any>(
  'ask/queryAI',
  async (data, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
      const response = await axios.post(`${BaseApiUrl}/api/ask-pdf`, data, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${AuthToken}`
        }
      })
      return response.data;
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to fetch dashboard data'
      );
    }
  }
)

export const QueryPrivateDocuments = createAsyncThunk<any, any>(
  'private-doc/queryAI',
  async (data, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
      const response = await axios.post(`${BaseApiUrl}/api/privateDocs/ask`, data, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${AuthToken}`
        }
      })
      return response.data;
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to fetch dashboard data'
      );
    }
  }
)

export const AuthenticityResponseHandler = createAsyncThunk<object, any>(
  'authenticity/verify',
  async (data, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
      const response = await axios.post(`${BaseApiUrl}/api/doc/authenticity`, data, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${AuthToken}`
        }
      })
      return response.data;
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to fetch dashboard data'
      );
    }
  }
)
const interfaceSlice = createSlice({
  name: 'interface',
  initialState,
  reducers: {
    setQuestion: (state, action) => {
      state.question = action.payload;
    },
    setDocUsed: (state, action) => {
      state.docUser.push(action.payload);
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
    }

  },
  extraReducers: (builder) => {
    builder.addCase(UploadDocuments.pending, (state) => {
      console.log("uploading doc pending")
      state.loading = true
    })
      .addCase(UploadDocuments.fulfilled, (state, action) => {
        console.log("uploading doc completed", action.payload)

        state.loading = false
      }).addCase(UploadDocuments.rejected, (state) => {
        console.log("uploading doc failed")
        state.loading = false;
      })

      //ask questions
      .addCase(QueryAIQuestions.pending, (state) => {
        console.log("QueryAIQuestions doc pending")

        state.loading = true
      })
      .addCase(QueryAIQuestions.fulfilled, (state, action) => {
        state.loading = false;
        console.log("QueryAIQuestions doc completed", action.payload)

        state.answer = action.payload.answer;
      }).addCase(QueryAIQuestions.rejected, (state) => {
        console.log("QueryAIQuestions doc failed")

        state.loading = false;
      })

      //query privatedocuments
      .addCase(QueryPrivateDocuments.pending, (state) => {
        console.log("QueryPrivateDocuments doc pending")

        state.loading = true
      })
      .addCase(QueryPrivateDocuments.fulfilled, (state, action) => {
        state.loading = false;
        console.log("QueryPrivateDocuments doc completed", action.payload)

        state.privateResponse = action.payload.answer;
      })
      .addCase(QueryPrivateDocuments.rejected, (state) => {
        console.log("QueryPrivateDocuments doc failed")

        state.loading = true;
      })

      //authenticiy handler
      .addCase(AuthenticityResponseHandler.pending, (state) => {
        console.log("AuthenticityResponseHandler doc pending")

        state.loading = true
      })
      .addCase(AuthenticityResponseHandler.fulfilled, (state, action) => {
        console.log("AuthenticityResponseHandler doc completed", action.payload)

        state.loading = false;
        state.likeness = "";
        state.suggestion = '';
      })
      .addCase(AuthenticityResponseHandler.rejected, (state) => {
        console.log("AuthenticityResponseHandler doc failed")
        state.loading = true;
      })

  },
});

export const {
  setQuestion, setAnswer, setLoading, setIsVisible, setCategory, setLikeness, setPrivateResponse, setQueryType, setShowDocs, setShowOptions, setShowSubcategory, setShowType, setShowUserForm, setSuggestion, setVisibility, setSubCategory, setDocUsed
} = interfaceSlice.actions;

export default interfaceSlice.reducer;