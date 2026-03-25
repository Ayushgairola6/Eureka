import { configureStore } from "@reduxjs/toolkit";
import AuthReducer from "./AuthSlice.ts";
import InterfaceReducer from "./InterfaceSlice.ts";
import ChatsReducer from "./chatRoomSlice.ts";
import SocketReducer from "./websockteSlice.ts";
import PaymentReducer from "./PaymentsSlice.ts";
import { socketMiddleware } from "./socketMiddleware.ts";
import ToolsReducer from "./ToolsSlice.ts";

export const store = configureStore({
  reducer: {
    auth: AuthReducer,
    interface: InterfaceReducer,
    chats: ChatsReducer,
    socket: SocketReducer,
    tools: ToolsReducer,
    payments: PaymentReducer,
  },
  // Optional: Add middleware like this
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(socketMiddleware),
});

// Infer RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
