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
} from "./websockteSlice.ts";
import { NewUserNotification } from "./AuthSlice.ts";
import { store } from "./reduxstore.ts";
const ServerUrl = import.meta.env.VITE_BACKEND_API_URL;

// import { data } from 'react-router';

let socket: Socket;
let listenerInitialized = false;
const setupSocketListeners = (dispatch: any) => {
  if (listenerInitialized || !socket) return;

  listenerInitialized = true;
  socket.on("connect", () => {
    // console.log("socket has connected");
    dispatch(setConnected());

    // Rejoin any rooms that were joined before if needed
    const state = store.getState();
    if (state.chats.room_name) {
      socket.emit("Joining_a_chat_room", state.chats.room_code);
    }
  });

  socket.on("room-info", (data) => {
    dispatch(Setroom_info(data));
  });

  socket.on("recieved_message", (data) => {
    // console.log("New message received:", data);
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
  socket.on("disconnect", () => {
    // console.log("Socket disconnected");
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
        const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");

        socket = io(ServerUrl, {
          reconnection: true,
          reconnectionAttempts: 5,
          transports: ["websocket", "polling"],
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
        } else {
          console.warn("Socket is not connected, unable to leave the chatroom");
        }
        break;
      case "socket/ChooseFile":
        const { file, room_id, username } = action.payload;
        if (socket && socket.connected) {
          socket.emit("NewFileSelected", { file, room_id, username });
        } else {
          console.warn("Socket is not connected, unable to leave the chatroom");
        }
        break;
      case "socket/isTyping":
        const data = action.payload;
        if (socket && socket.connected) {
          socket.emit("isTyping", data);
        } else {
          console.warn("Socket is not connected, unable to leave the chatroom");
        }
        break;
      case "socket/sendMessage":
        const payload = action.payload;
        if (socket && socket.connected) {
          socket.emit("new_message", payload);
        } else {
          console.warn("Socket is not connected, unable to send the message");
        }
        break;
      //  socket.on("recieved_message", (data) => {
      //                     console.log(`This new message has been recieved from the server :${data}`)
      //                 })
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
