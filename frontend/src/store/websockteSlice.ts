import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;

interface RoomMembers {
  user: string;
}
interface RoomDataPayload {
  room_id: string | null;
  room_name: string | null;
  username: string | null;
  user_id: string;
}
interface users {
  username: string;
}
interface NewMessages {
  message_id: string;
  message: string;
  sent_by: string;
  sent_at: Date;
  room_id: string;
  users: users;
}

interface leaveroom {
  room_id: string;
  username: string;
}
interface chatRoomFile {
  chunk_count: string;
  created_at: string;
  document_id: string;
  feedback: string;
  id: string;
  user_id: string;
}
interface Favicon {
  MessageId: string;
  favicon: any[];
}
// the states that we are gonna need for the user experience
interface chatStates {
  isConnected: boolean;
  newMessage: NewMessages[];
  errorMessage: string | null;
  response: string | null;
  roomnotification: string | null;
  gettingOldMessage: boolean | null;
  whoistyping: string;
  membername: RoomMembers[];
  chatRoomFile: chatRoomFile | null;
  favicon: Favicon[];
}
const initialState: chatStates = {
  isConnected: false,
  newMessage: [],
  errorMessage: null,
  response: null,
  roomnotification: null,
  gettingOldMessage: false,
  whoistyping: "",
  membername: [],
  chatRoomFile: null,
  favicon: [],
};
export const GetChatRoomHistory = createAsyncThunk(
  "room/history",
  async (room_id: string, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
      const response = await axios.get(
        `${BaseApiUrl}/api/user/chatrooms/${room_id}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${AuthToken}`,
          },
        }
      );
      // console.log(response.data)
      return response.data.chats;
    } catch (err: any) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to fetch history"
      );
    }
  }
);
export const AskAI = createAsyncThunk<any, any>(
  "Ai/AskEureka",
  async (
    { question, document_id, room_id, user_id, MessageId },
    { rejectWithValue }
  ) => {
    try {
      const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
      const response = await axios.post(
        `${BaseApiUrl}/api/chat-room/ask-doc`,
        { question, document_id, room_id, user_id, MessageId },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${AuthToken}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "I was unable to find relevant information about the question you asked in this document"
      );
    }
  }
);

//web search for chatrooms

export const SearchWeb = createAsyncThunk<any, any>(
  "Search/AskEureka-web",
  async ({ room_id, MessageId, query }, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
      const response = await axios.post(
        `${BaseApiUrl}/api/chat-room/ask-web/${query}`,
        { room_id, MessageId },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${AuthToken}`,
          },
        }
      );
      return {
        answer: response.data.answer,
        favicon: response.data.favicon || [],
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "I was unable to find relevant information about the question you asked in this document"
      );
    }
  }
);

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    // Actions to trigger the middleware
    connectSocket: () => {},
    disconnectSocket: () => {},
    setConnected: (state) => {
      // console.log("socket has connected")
      state.isConnected = true;
    },
    setDisconnected: (state) => {
      state.isConnected = false;
    },
    AddNewMessage: (state, action) => {
      // if the message is not already in the array
      const ItIncludes = state.newMessage.find(
        (msg) => msg.message_id === action.payload.message_id
      );
      if (!ItIncludes) {
        state.newMessage.push(action.payload);
      }
    },
    // update the array for local updates
    sendMessage: (state, action) => {
      // only add users messaeg in the messages array
      const userMessage = action.payload;
      // for quick ui updates add it
      state.newMessage.push(userMessage);
    },
    setWhoIsTyping: (state) => {
      state.whoistyping = "";
    },
    // error event emitted by the websocket
    ErrorOccured: (state, action) => {
      state.errorMessage = action.payload.error;
    },
    joinAChatRoom: (_state, _action: PayloadAction<RoomDataPayload>) => {},
    Setroom_info: (state, action) => {
      state.membername = [...action.payload];
    },
    setFavicon: (state, action) => {
      state.favicon.push(action.payload);
    },
    leaveChatRoom: (_state, _action: PayloadAction<leaveroom>) => {},

    // new message reducer
    NewMessageReceived: (state, action) => {
      const messageFromServer = action.payload;

      // Find the index of the message with the matching message_id.
      const existingMessage = state.newMessage.some(
        (message) =>
          message.message_id === messageFromServer.message_id &&
          message.message === action.payload.message
      );

      if (!existingMessage) {
        state.whoistyping = "";
        state.newMessage.push(action.payload);
      }
    },
    leavingRoomNotification: (state, action) => {
      state.response = action.payload.message;
    },
    RoomNotification: (state, action) => {
      state.response = action.payload.message;
    },
    isTyping: (_state, _action) => {},
    whoIsTyping: (state, action) => {
      state.whoistyping = action.payload;
    },
    ChooseFile: (_state, _action) => {},
    SetChatRoomFile: (state, action) => {
      state.chatRoomFile = action.payload;
    },
  },

  //extrareducers
  extraReducers(builder) {
    builder
      .addCase(GetChatRoomHistory.fulfilled, (state, action) => {
        state.gettingOldMessage = false;
        state.newMessage = [...action.payload];
      })
      .addCase(GetChatRoomHistory.pending, (state) => {
        state.gettingOldMessage = true;
      })
      .addCase(GetChatRoomHistory.rejected, (state) => {
        state.gettingOldMessage = false;
      });
    // ask ai function for chatrooms
    // .addCase(AskAI.rejected, (state, action) => {
    // })
  },
});

export const {
  connectSocket,
  disconnectSocket,
  setConnected,
  setDisconnected,
  sendMessage,
  joinAChatRoom,
  leaveChatRoom,
  NewMessageReceived,
  ErrorOccured,
  leavingRoomNotification,
  RoomNotification,
  Setroom_info,
  isTyping,
  whoIsTyping,
  setWhoIsTyping,
  ChooseFile,
  SetChatRoomFile,
  AddNewMessage,
  setFavicon,
} = socketSlice.actions;
export default socketSlice.reducer;
