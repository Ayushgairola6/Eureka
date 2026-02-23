// features/socket/socketMiddleware.js
import { io, Socket } from "socket.io-client";
import {
  setConnected,
  setDisconnected,
  NewMessageReceived,
  RoomNotification,
  Setroom_info,
  whoIsTyping,
  SetChatRoomFile,
  setCurrentStatus,
  setWebStatus,
} from "./websockteSlice.ts";
import {
  NewUserNotification,
  UpdatedPreference,
  SetCookies,
} from "./AuthSlice.ts";
import { store } from "./reduxstore.ts";
import { ResponseLikeStatus, setUploadStatus } from "./InterfaceSlice.ts";
const ServerUrl = import.meta.env.VITE_BACKEND_API_URL;

// import { data } from 'react-router';

let socket: Socket;
let listenerInitialized = false;
const setupSocketListeners = (dispatch: any) => {
  if (listenerInitialized || !socket) return;

  listenerInitialized = true;
  socket.on("connect", () => {
    dispatch(setConnected());

    // Rejoin any rooms that were joined before if needed
    const state = store.getState();
    if (state.chats.room_name) {
      socket.emit("Joining_a_chat_room", state.chats.room_code);
    }
  });

  //the web search event
  socket.on("query_status", (data) => {
    dispatch(setWebStatus(data));
  });

  //responseliked status
  socket.on("feedback_recorded", (data) => {
    if (data && data.id && data.status) dispatch(ResponseLikeStatus(data));
  });
  ///getting room_info
  socket.on("room-info", (data) => {
    dispatch(Setroom_info(data));
  });

  socket.on("reauthenticate", (data) => {
    localStorage.setItem("AntiNode_six_eta_v1_Authtoken", data.newAccessToken);
    dispatch(SetCookies(data.newAccessToken));
  });
  socket.on("recieved_message", (data) => {
    dispatch(NewMessageReceived(data));
    dispatch(whoIsTyping(""));
  });

  socket.on("Room_notification", (data) => {
    if (data.message && data.message.trim() !== "") {
      dispatch(RoomNotification(data));
    }
  });

  socket.on("NewFileForRoom", (fileFromServer) => {
    dispatch(SetChatRoomFile(fileFromServer));
  });
  socket.on("new_Notification", (data) => {
    dispatch(NewUserNotification(data));
  });

  socket.on("someone-typing", (data) => {
    dispatch(whoIsTyping(data));
  });
  //listening to preferenec update event
  socket.on("updated_preference", (data) => {
    dispatch(UpdatedPreference(data));
  });
  //updation of synthesis state
  socket.on("SynthesisStatus", (data) => {
    const message = data;
    dispatch(setCurrentStatus(message));
  });
  //upload status state updation for UX
  socket.on("UploadStatus", (data) => {
    dispatch(setUploadStatus(data));
  });

  //disconnection handler
  socket.on("disconnect", () => {
    dispatch(setDisconnected());
  });
};

// let storeRef = null;
// middleware to handle socket events
export const socketMiddleware =
  (store: any) => (next: any) => (action: any) => {
    const { dispatch } = store;
    // storeRef = store;

    // reading the connectSocket reducer function
    switch (action.type) {
      case "socket/connectSocket":
        // Clean up any existing socket and listeners before creating a new one
        if (socket) {
          socket.off();
          socket.disconnect();
          listenerInitialized = false;
        }
        const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");

        socket = io(ServerUrl, {
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
          auth: {
            token: AuthToken,
          },
          withCredentials: true,
        });
        setupSocketListeners(dispatch);
        break;

      case "socket/joinAChatRoom":
        const room_data = action.payload;
        if (socket && socket.connected) {
          socket.emit("Joining_a_chat_room", room_data);
        } else {
          console.warn(
            "Socket is not connected, unable to Joining the chatroom"
          );
        }
        break;

      case "socket/leaveChatRoom":
        const room_info = action.payload;
        if (socket && socket.connected) {
          socket.emit("leaving_chat_room", room_info);
          socket.off("recieved_message");
          socket.off("Room_notification");
          socket.off("room-info");
        }
        break;

      case "socket/ChooseFile":
        const { file, room_id, username } = action.payload;
        if (socket && socket.connected) {
          socket.emit("NewFileSelected", { file, room_id, username });
        }
        break;
      case "socket/isTyping":
        const userdata = action.payload;
        if (socket && socket.connected) {
          socket.emit("isTyping", userdata);
        }
        break;

      case "interface/likeResponse":
        const { data, vote_type, user_id, id } = action.payload;
        if (socket && socket.connected) {
          socket.emit("liked_response", data, vote_type, user_id, id);
        }
        break;

      case "socket/sendMessage":
        const payload = action.payload;
        if (socket && socket.connected) {
          socket.emit("new_message", payload);
        }
        break;

      // reading the disconnectSocket reducer function

      case "socket/disconnectSocket":
        if (socket) {
          socket.disconnect();
        }
        break;

      default:
        break;
    }

    return next(action);
  };
