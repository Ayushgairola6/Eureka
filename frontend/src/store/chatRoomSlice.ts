import { createSlice } from '@reduxjs/toolkit';
// import type { RootState } from './reduxstore';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL

interface ChatRoomState {
    room_name: string;
    room_code: number | null;
    RoomCreationIspending: boolean;
    isJoiningRoom: boolean;
    DocChats: DocChats[];
    isOpen:boolean
}
interface RoomData {
    Room_name: string;
    participant_count: string | number;
    Room_type: string;
    Description: string;
}
interface ApiResponse {
    message: string
}
interface DocChats {
    created_at: string
    question: string
    AI_response: string
    user_id: string
}
const initialState: ChatRoomState = {
    room_name: "",
    room_code: null,
    RoomCreationIspending: false,
    isJoiningRoom: false,
    DocChats: [],
    isOpen:false
}

export const CreateChatRoom = createAsyncThunk<ApiResponse, RoomData>(
    'chat/createRoom',
    async (Data: RoomData, { rejectWithValue }) => {
        try {
            const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
            const response = await axios.post(`${BaseApiUrl}/api/user/request/create-room`, Data, {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${AuthToken}`
                }
            })
            // console.log(response.data)
            if (response.data.message === 'Room created Successfully !') {
                return response.data.message;
            }
        } catch (err: any) {
            console.error("Error fetching dashboard data:", err);
            return rejectWithValue(
                err instanceof Error ? err.message : 'Failed to fetch dashboard data'
            );
        }
    }
)

export const JoinAChatRoom = createAsyncThunk<ApiResponse, string>(
    'chat/joinRoom',
    async (joincode: string, { rejectWithValue }) => {
        try {
            const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
            const response = await axios.post(`${BaseApiUrl}/api/user/request/${joincode}`, {}, {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${AuthToken}`
                }
            })
            return response.data
        } catch (err: any) {
            console.error("Error fetching dashboard data:", err);
            return rejectWithValue(
                err instanceof Error ? err.message : 'Failed to join'
            );
        }
    }
)

// get document related chat history
export const GetDocumentChatHistory = createAsyncThunk(
    'get/document_chats',
    async (document_id: string, { rejectWithValue }) => {
        try {
            const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
            const response = await axios.get(`${BaseApiUrl}/api/user/document/chat-history/${document_id}`, {
                withCredentials: true,
                headers: {
                    "Authorization": `Bearer ${AuthToken}`
                }
            })
            // console.log(response.data)
            return response.data;
        } catch (err) {
            console.error("Error fetching chats data:", err);
            return rejectWithValue(
                err instanceof Error ? err.message : 'Failed to join'
            );
        }
    }
)

const ChatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
          setOpen:(state,action)=>{
            state.isOpen = action.payload;
          }
    },
    extraReducers: (builder) => {
        //creating a chatroom
        builder.addCase(CreateChatRoom.pending, (state) => {
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
            }).addCase(JoinAChatRoom.fulfilled, (state) => {
                state.isJoiningRoom = false;
            })
            // getting past document related chats
            .addCase(GetDocumentChatHistory.fulfilled, (state, action) => {
                state.DocChats = [...action.payload]
            })

    },
});


export const {setOpen} = ChatSlice.actions;
export default ChatSlice.reducer;