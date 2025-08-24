import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;



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
}

const initialState: InterfaceState = {
  question: "",
  answer: "",
  loading: false,
  isVisible: false, category: '', subCategory: "", visibility: "Public", showSubcategory: false, shhowUserForm: false, showDocs: false, privateResponse: '', likeness: "", suggestion: "", shwoOptions: false, showType: false, queryType: ""
};

// Async Thunks
export const uploadDocument = createAsyncThunk(
  'interface/uploadDocument',
  async (payload: { formData: FormData; selectedFile: File | null; category: string; visibility: string; subCategory: string }) => {
    const { formData, selectedFile, category, visibility, subCategory } = payload;

    if (!selectedFile || category === " " || !formData || !visibility || !subCategory) {
      throw new Error(!selectedFile ? 'Please select a PDF file first.' : "Please select a category first.");
    }

    const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
    const response = await axios.post(`${BaseApiUrl}/api/upload-pdf`, formData, {
      withCredentials: true,
      headers: {
        "Authorization": `Bearer ${AuthToken}`,
      }
    });

    return response.data;
  }
);

export const askQuestion = createAsyncThunk(
  'interface/askQuestion',
  async (payload: { question: string; category: string; subCategory: string }) => {
    const { question, category, subCategory } = payload;

    if (!question.trim() || !category || category === "") {
      throw new Error(!question ? 'Please enter a question.' : 'Please choose a category!');
    }

    const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
    const response = await axios.post(`${BaseApiUrl}/api/ask-pdf`, {
      question,
      category,
      subCategory
    }, {
      withCredentials: true,
      headers: {
        "Authorization": `Bearer ${AuthToken}`
      }
    });

    return response.data;
  }
);

export const queryPrivateDocument = createAsyncThunk(
  'interface/queryPrivateDocument',
  async (payload: { question: string; selectedDoc: string; queryType: string }) => {
    const { question, selectedDoc, queryType } = payload;

    if (!question) {
      throw new Error("Question cannot be empty !");
    }
    if (!selectedDoc) {
      throw new Error("Please select a document before querying");
    }
    if (!queryType) {
      throw new Error("Please select a query type");
    }

    const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
    const response = await axios.post(`${BaseApiUrl}/api/privateDocs/ask`, {
      question,
      docId: selectedDoc,
      query_type: queryType
    }, {
      withCredentials: true,
      headers: {
        'Authorization': `Bearer ${AuthToken}`
      }
    });

    return response.data;
  }
);



const interfaceSlice = createSlice({
  name: 'interface',
  initialState,
  reducers: {
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
    }

  },
  extraReducers: (_builder) => {

  },
});

export const {
  setQuestion, setAnswer, setLoading, setIsVisible, setCategory, setLikeness, setPrivateResponse, setQueryType, setShowDocs, setShowOptions, setShowSubcategory, setShowType, setShowUserForm, setSuggestion, setVisibility,setSubCategory
} = interfaceSlice.actions;

export default interfaceSlice.reducer;