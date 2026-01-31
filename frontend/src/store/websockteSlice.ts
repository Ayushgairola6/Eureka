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
  created_at: string | null;
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
interface WebSearchStatus {
  MessageId: string;
  status: { message: string; data: any[] }[]; // ← Array notation after the type
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
  fetchingMoreChats: boolean;
  currentStatus: string;
  web_search_status: WebSearchStatus[];
  showProcess: { message_id: string; status: boolean } | null;
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
  currentStatus: "Analyzing",
  fetchingMoreChats: false,
  web_search_status: [
    // {
    //   MessageId: "12345",
    //   status: [
    //     {
    //       message: "reading_links",
    //       data: [
    //         "https://youtube.com",
    //         "https://pornhub.com",
    //         "https://brazzers.com",
    //         "https://blacked.com",
    //         "https://cum4k.com",
    //       ],
    //     },
    //     {
    //       message: "Understanding_Intent",
    //       data: [
    //         "I am now trying to understand the intent behind my boss'es request to gather the best porn from the depths of the web",
    //       ],
    //     },
    //     {
    //       message: "Crawling_deep_web",
    //       data: [
    //         "I am now crawling deep web to search for best porn playlist for my boss.",
    //       ],
    //     },
    //     { message: "fetching_url", data: ["https://xvideos.com"] },
    //     { message: "fetching_url", data: ["https://KinComiX.com"] },
    //     { message: "fetching_url", data: ["https://sexKomix.com"] },
    //   ],
    // },
  ],
  showProcess: null,
};
export const GetChatRoomHistory = createAsyncThunk(
  "room/history",
  async (room_id: string, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");
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
export const AskAI = createAsyncThunk<any, any>(
  "Ai/AntiNode",
  async (
    { question, document_id, room_id, user_id, MessageId },
    { rejectWithValue }
  ) => {
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");
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

//web search for chatrooms

export const SearchWeb = createAsyncThunk<any, any>(
  "Search/AntiNodeweb",
  async (
    { room_id, MessageId, query, web_search_depth },
    { rejectWithValue }
  ) => {
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");
      const response = await axios.post(
        `${BaseApiUrl}/api/user/chat-room/ask-web`,
        { room_id, MessageId, query, web_search_depth },
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

//fetches moremessages for the user in the chatRoomb based on the subscription
export const FetchMoreChatsInTheRoom = createAsyncThunk<any, object>(
  "get/more-chats",
  async (data, { rejectWithValue }) => {
    try {
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");
      const response = await axios.post(
        `${BaseApiUrl}/api/room/history/chats`,
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
    setProcess: (state, action) => {
      //if the message is selected twice
      if (state?.showProcess?.message_id && state?.showProcess.status) {
        if (state.showProcess?.message_id === action.payload) {
          state.showProcess.message_id = "";
          state.showProcess.status = !state.showProcess.status;
        } else {
          state.showProcess.message_id = action.payload.message;
          state.showProcess.status = true;
        }
      }
    },
    setCurrentStatus: (state, action) => {
      state.currentStatus = action.payload;
    },
    setDisconnected: (state) => {
      state.isConnected = false;
    },
    AddNewMessage: (state, action) => {
      // if the message is not already in the array
      const ItIncludes = state.newMessage.findIndex(
        (msg) => msg.message_id === action.payload.message_id
      );
      // if the message is new let it rip
      if (!ItIncludes) {
        state.newMessage.push(action.payload);
      } else {
        //finish the answer of the existing pushed message and replace with the new value to it
        state.newMessage[ItIncludes].message = action.payload.message;
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
    setWebStatus: (state, action) => {
      if (action.payload) {
        const existingIndex = state.web_search_status.findIndex(
          (e) => e.MessageId === action.payload.MessageId
        );

        if (existingIndex !== -1) {
          // Update existing message - push new status
          state.web_search_status[existingIndex].status.push(
            action.payload.status
          );
        } else {
          // New message - add with status as array
          state.web_search_status.push({
            MessageId: action.payload.MessageId,
            status: [action.payload.status],
          });
        }
      }
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
      })
      //fethcing more messages for the room
      //fetching more chats
      .addCase(FetchMoreChatsInTheRoom.rejected, (state, _action) => {
        state.fetchingMoreChats = false;
      })
      .addCase(FetchMoreChatsInTheRoom.pending, (state, _action) => {
        state.fetchingMoreChats = true;
      })
      .addCase(FetchMoreChatsInTheRoom.fulfilled, (state, _action) => {
        state.fetchingMoreChats = false;
        if (_action.payload.history) {
          state.newMessage = [..._action.payload.history, ...state.newMessage];
        }
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
  setCurrentStatus,
  setWebStatus,
  setProcess,
} = socketSlice.actions;
export default socketSlice.reducer;
