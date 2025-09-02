import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL

interface RoomMembers {
    user: string
}
interface RoomDataPayload {
    room_id: string | null,
    room_name: string | null,
    username: string | null,
    user_id: string
}
interface users {
    username: string
}
interface NewMessages {
    message_id: string
    message: string
    sent_by: string
    sent_at: Date
    room_id: string
    users: users
}

interface leaveroom {
    room_id: string
    username: string
}
// the states that we are gonna need for the user experience
interface chatStates {
    isConnected: boolean
    newMessage: NewMessages[]
    errorMessage: string | null
    response: string | null
    roomnotification: string | null
    gettingOldMessage: boolean | null
    whoistyping: string | null
    membername: RoomMembers[]


}
const initialState: chatStates = {
    isConnected: false,
    newMessage: [],
    errorMessage: null,
    response: null,
    roomnotification: null,
    gettingOldMessage: false,
    whoistyping: null,
    membername: []

};
export const GetChatRoomHistory = createAsyncThunk(

    'room/history',
    async (room_id: string, { rejectWithValue }) => {
        try {
            const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
            const response = await axios.get(`${BaseApiUrl}/api/user/chatrooms/${room_id}`, {
                withCredentials: true,
                headers: {
                    "Authorization": `Bearer ${AuthToken}`
                }
            })
            // console.log(response.data)
            return response.data.chats
        } catch (err: any) {
            console.error("Error getting room history:", err);
            return rejectWithValue(
                err instanceof Error ? err.message : 'Failed to fetch history'
            );
        }
    }
)



const socketSlice = createSlice({
    name: 'socket',
    initialState,
    reducers: {
        // Actions to trigger the middleware
        connectSocket: () => {
            // No state change here, the middleware will handle the connection
            console.log('Attempting to connect to socket...');
        },
        disconnectSocket: () => {
            // No state change here, middleware will handle disconnection
        },
        // Actions to be dispatched by the middleware
        setConnected: (state) => {
            // console.log("socket has connected")
            state.isConnected = true;
        },
        setDisconnected: (state) => {
            state.isConnected = false;
        },
        // update the array for local updates
        sendMessage: (state, action) => {
            // only add users messaeg in the messages array 
            const userMessage = action.payload;
            // for quick ui updates add it 
            state.newMessage.push(userMessage);
        },
        // error event emitted by the websocket
        ErrorOccured: (state, action) => { state.errorMessage = action.payload.error },
        joinAChatRoom: (_state, _action: PayloadAction<RoomDataPayload>) => {
        }, Setroom_info: (state, action) => {
            state.membername = [ ...action.payload];
        },
        leaveChatRoom: (_state, _action: PayloadAction<leaveroom>) => { },

        // new message reducer
        NewMessageReceived: (state, action) => {
            const messageFromServer = action.payload;

            // Find the index of the message with the matching message_id.
            const existingMessage = state.newMessage.some(
                (message) => message.message_id === messageFromServer.message_id && message.message === action.payload.message
            );

            if (!existingMessage) {
                state.newMessage.push(action.payload)
            }

        },
        leavingRoomNotification: (state, action) => {
            state.response = action.payload.message;
        },
        RoomNotification: (state, action) => {
            state.response = action.payload.message;
        },


    },

    //extrareducers
    extraReducers(builder) {
        builder.addCase(GetChatRoomHistory.fulfilled, (state, action) => {
            state.gettingOldMessage = false;
            state.newMessage = [...state.newMessage, ...action.payload];
        })
            .addCase(GetChatRoomHistory.pending, (state) => {
                state.gettingOldMessage = true;
            })
            .addCase(GetChatRoomHistory.rejected, (state) => {
                state.gettingOldMessage = false;
            })
    },
});

export const { connectSocket, disconnectSocket, setConnected, setDisconnected, sendMessage, joinAChatRoom, leaveChatRoom, NewMessageReceived, ErrorOccured, leavingRoomNotification, RoomNotification, Setroom_info } = socketSlice.actions;
export default socketSlice.reducer;