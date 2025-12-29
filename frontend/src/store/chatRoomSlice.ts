import { createSlice } from "@reduxjs/toolkit";
// import type { RootState } from './reduxstore';
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import _ from "lodash";
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;

interface ChatRoomState {
  room_name: string;
  room_code: number | null;
  RoomCreationIspending: boolean;
  isJoiningRoom: boolean;
  DocChats: DocChats[];
  Misallaneouschats: Misallaneouschats[];
  isOpen: boolean;
  cursor: any;
  hasMore: boolean;
  gettingChats: boolean;
  RoomQueryMode: string;
  RoomSynthesisDocs: string[];
  showSyntheSisPanel: boolean;
  synthesisQuery: string;
  isSynthesizing: boolean;
}
interface RoomData {
  Room_name: string;
  participant_count: string | number;
  Room_type: string;
  Description: string;
}
interface ApiResponse {
  message: string;
}
interface DocChats {
  created_at: string;
  question: string;
  AI_response: string;
  user_id: string;
}
interface metadata {
  category: string;
  subcategory: string;
}
interface Misallaneouschats {
  created_at: string;
  question: string;
  AI_response: string;
  metadata: metadata;
}
const initialState: ChatRoomState = {
  room_name: "",
  room_code: null,
  RoomCreationIspending: false,
  isJoiningRoom: false,
  DocChats: [],
  Misallaneouschats: [],
  isOpen: false,
  cursor: null,
  hasMore: false,
  gettingChats: false,
  RoomQueryMode: "",
  RoomSynthesisDocs: [],
  showSyntheSisPanel: false,
  synthesisQuery: "",
  isSynthesizing: false,
};

export const CreateChatRoom = createAsyncThunk<ApiResponse, RoomData>(
  "chat/createRoom",
  async (Data: RoomData, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");
      const response = await axios.post(
        `${BaseApiUrl}/api/user/request/create-room`,
        Data,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${AuthToken}`,
          },
        }
      );
      // console.log(response.data)
      if (response.data.message === "Room created Successfully !") {
        return response.data.message;
      }
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to fetch dashboard data"
      );
    }
  }
);

export const JoinAChatRoom = createAsyncThunk<ApiResponse, string>(
  "chat/joinRoom",
  async (joincode: string, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");
      const response = await axios.post(
        `${BaseApiUrl}/api/user/request/${joincode}`,
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
        err instanceof Error ? err.message : "Failed to join"
      );
    }
  }
);

// get document related chat history
export const GetDocumentChatHistory = createAsyncThunk(
  "get/document_chats",
  async (document_id: string, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");
      const response = await axios.get(
        `${BaseApiUrl}/api/user/document/chat-history/${document_id}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${AuthToken}`,
          },
        }
      );
      // console.log(response.data)
      return response.data;
    } catch (err) {
      console.error("Error fetching chats data:", err);
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to join"
      );
    }
  }
);

export const GetMisallaneousChatHistory = createAsyncThunk<any, any>(
  "get/Misallaneouschats",
  async (cursor = null, { rejectWithValue }) => {
    // cursor is the created_at timestamp
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");

      const params: any = {};
      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axios.get(
        `${BaseApiUrl}/api/user/doc/misallaneous-history`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${AuthToken}`,
          },
          params: params,
        }
      );
      return response.data;
    } catch (err: any) {
      console.error("Error fetching chats data:", err);
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to fetch chats"
      );
    }
  }
);
//get synthesized results
export const GetSynthesizedResult = createAsyncThunk<any, any>(
  "query/synthesis",
  async (data, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");

      const response = await axios.post(
        `${BaseApiUrl}/api/chatroom/synthesis`,
        data,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${AuthToken}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message);
    }
  }
);

const ChatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setOpen: (state, action) => {
      state.isOpen = action.payload;
    },
    setRoomQueryMode: (state, action) => {
      state.RoomQueryMode = action.payload;
    },
    setRoomSynthesisDocs: (state, action) => {
      const value = action.payload;
      //if the value is in the array remove it else create a new once
      if (!state.RoomSynthesisDocs.includes(value)) {
        console.log("Value already exists", value);
        state.RoomSynthesisDocs.push(action.payload);
      } else {
        //create new array and append it into the original one
        const Filtered = state.RoomSynthesisDocs.filter((e) => e !== value);
        state.RoomSynthesisDocs = [...Filtered];
        console.log("Removing the value", value);
      }
    },
    emptyArray: (state) => {
      state.RoomSynthesisDocs = [];
    },
    setSyntheSisQuery: (state, action) => {
      state.synthesisQuery = action.payload;
    },
    setShowSynthesisPanel: (state, action) => {
      state.showSyntheSisPanel = action.payload;
    },
  },
  extraReducers: (builder) => {
    //creating a chatroom
    builder
      .addCase(CreateChatRoom.pending, (state) => {
        state.RoomCreationIspending = true;
      })
      .addCase(CreateChatRoom.rejected, (state) => {
        state.RoomCreationIspending = false;
      })
      .addCase(CreateChatRoom.fulfilled, (state) => {
        state.RoomCreationIspending = false;
      })
      // joining a chatroom with a joining code
      .addCase(JoinAChatRoom.rejected, (state) => {
        state.isJoiningRoom = false;
      })
      .addCase(JoinAChatRoom.pending, (state) => {
        state.isJoiningRoom = true;
      })
      .addCase(JoinAChatRoom.fulfilled, (state) => {
        state.isJoiningRoom = false;
      })
      // getting past document related chats
      .addCase(GetDocumentChatHistory.fulfilled, (state, action) => {
        state.DocChats = [...action.payload];
      })
      .addCase(GetDocumentChatHistory.rejected, (_state, _action) => {})
      .addCase(GetDocumentChatHistory.pending, (_state, _action) => {})
      //getting misallaneous chat histor
      .addCase(GetMisallaneousChatHistory.fulfilled, (state, action) => {
        state.gettingChats = false;
        const { data, nextCursor, hasMore } = action.payload;
        state.Misallaneouschats = [...state.Misallaneouschats, ...data];
        state.cursor = nextCursor;
        state.hasMore = hasMore !== false;
      })
      .addCase(GetMisallaneousChatHistory.rejected, (state, _action) => {
        state.gettingChats = false;
      })
      .addCase(GetMisallaneousChatHistory.pending, (state, _action) => {
        state.gettingChats = true;
      })
      //synthesis handler
      .addCase(GetSynthesizedResult.pending, (state, _action) => {
        state.isSynthesizing = true;
      })
      .addCase(GetSynthesizedResult.rejected, (state, _action) => {
        state.isSynthesizing = false;
      })
      .addCase(GetSynthesizedResult.fulfilled, (state, _action) => {
        state.isSynthesizing = false;
        // state.
      });
  },
});

export const {
  setOpen,
  setRoomSynthesisDocs,
  setRoomQueryMode,
  emptyArray,
  setSyntheSisQuery,
  setShowSynthesisPanel,
} = ChatSlice.actions;
export default ChatSlice.reducer;
