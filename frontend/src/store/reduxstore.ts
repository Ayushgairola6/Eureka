import { configureStore } from '@reduxjs/toolkit';
import AuthReducer from './AuthSlice.ts';
import InterfaceReducer from './InterfaceSlice.ts'
import ChatsReducer from './chatRoomSlice.ts';
import SocketReducer from './websockteSlice.ts'
import { socketMiddleware } from './socketMiddleware.ts';


export const store = configureStore({
  reducer: {
    auth: AuthReducer,
    interface: InterfaceReducer,
    chats: ChatsReducer,
    socket: SocketReducer
  },
  // Optional: Add middleware like this
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(socketMiddleware),
});

// Infer RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;