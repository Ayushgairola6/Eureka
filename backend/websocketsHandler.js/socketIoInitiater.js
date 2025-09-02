import { supabase } from '../controllers/supabaseHandler.js';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'socket.io-cookie-parser'
import { GenerateAccessTokens } from '../controllers/AuthController.js';
import { verifyJwtAsync } from '../Middlewares/AuthMiddleware.js';
import { Server } from 'socket.io'


const Room_And_their_members = new Map();
// Authenticating the user
let io;
export const initializeSocketIo = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173", // Your frontend URL
            credentials: true,
            allowedHeaders: [
                "Content-Type",
                "Authorization",
                "X-Requested-With",
                "Accept"
            ],
            methods: ["GET", "POST", "OPTIONS"]
        }
    })


    io.use(cookieParser());

    // verify the user to give access to the server
    io.use(async (socket, next) => {
        const handshaketoken = socket.handshake.auth.token;
        const cookietoken = socket.request.headers.cookie['Eureka_eta_six_version1_AuthToken'];
        const token = cookietoken ? cookietoken : handshaketoken;

        if (!token) {
            return next(new Error('Authentication error: Token not provided'));
        }

        try {
            const decoded = await verifyJwtAsync(token, process.env.JWT_SECRET);
            socket.user_id = decoded.user_id;
            return next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                const DecodedData = jwt.decode(token);
                if (!DecodedData || !DecodedData.user_id) {
                    return next(new Error('Authentication error: Malformed token'));
                }

                // Retrieve refresh token from DB (assuming you have a function for this)
                const { data, error } = await supabase
                    .from("Tokens")
                    .select("Refresh_Token")
                    .eq('user_id', DecodedData.user_id);

                if (error || !data || !data.length) {
                    return next(new Error('Authentication error: No refresh token found'));
                }

                const refreshToken = data[0]?.Refresh_Token;
                try {
                    const refreshDecoded = await verifyJwtAsync(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                    const newAccessToken = GenerateAccessTokens(
                        refreshDecoded.user_id,
                        refreshDecoded.email,
                        refreshDecoded.username
                    );

                    // Update the token in the database
                    await supabase
                        .from("Tokens")
                        .update({ Access_Token: newAccessToken })
                        .eq("Refresh_Token", refreshToken);

                    // ❗ Crucial Step: Send the new token to the client.
                    socket.emit('reauthenticate', { newAccessToken });

                    // Attach the new user data to the socket and allow the connection to proceed
                    socket.user_id = refreshDecoded.user_id;
                    return next();

                } catch (refreshErr) {
                    return next(new Error('Authentication error: Invalid or expired refresh token'));
                }
            }
            // Handle other JWT errors (e.g., JsonWebTokenError)
            return next(new Error('Authentication error: Invalid token'));
        }
    });


    // connecting with the websocket connection
    io.on("connection", (socket) => {
        // joining a specific chatRoom
        if (socket.user_id) {
            socket.join(socket.user_id)
        }
        socket.on("Joining_a_chat_room", (room_information) => {

            const { username, room_id, room_name, user_id } = room_information;
            if (!room_id || !room_name || !username || !user_id) {
                socket.emit("Room_notification", { error: 'An error occured while trying to joining the room' });
                return;
            }

            // join the user themselves so that they can recieve notifications
            // join the room

            socket.join(room_id);
            // if the key related to the user has not been yet recorded record it
            if (!Room_And_their_members.has(`user&${username}&joined&room&${room_id}`)) {
                Room_And_their_members.set(`user&${username}&joined&room&${room_id}`, username);
            }
            const membername = [];
            const members_of_the_room = Room_And_their_members.forEach((value, key) => {
                if (key) {
                    const theFoundRoom_id = key.split("&")[4]
                    // console.log(theFoundRoom_id, 'found-id', 'existing-id', room_id)
                    if (theFoundRoom_id === room_id) {
                        // console.log('found the matching value')
                        membername.push({ user: value });
                    }
                }
            })
            // console.log(membername)
            // emit the notification
            io.to(room_id).emit("room-info", membername)
            io.to(room_id).emit("Room_notification", { message: `${username} Joined the room` })
        })

        // leaving a chatRoom
        socket.on("leaving_chat_room", (data) => {
            const { room_id, username } = data;
            if (!room_id || !username) {
                socket.emit("Room_notification", { error: "Unable to leave the room" });
                return;
            }

            // Leave the room then notify others in that room
            if (Room_And_their_members.has(`user&${username}&joined&room&${room_id}`)) {
                Room_And_their_members.clear(`user&${username}&joined&room&${room_id}`, username);
            }
            socket.leave(room_id);

            // Broadcast to everyone EXCEPT the socket that is leaving
            socket.to(room_id).emit("Room_notification", {
                message: `${username} left the room`
            });
            return;

        });

        // sending new message
        socket.on("new_message", async (data) => {
            const { message_id, sent_by, message, room_id, users, sent_at } = data;

            if (!sent_by || !message || !room_id || typeof message !== 'string' || !users || typeof users !== 'object' || !message_id) {
                socket.emit("Room_notification", { error: "Some fields are missing" });
                return;
            }

            try {
                // do not store the sytem messages
                // Store message in database
                if (sent_by !== "SYSTEM") {
                    const storeResult = await StoreMessage(sent_by, message, room_id, message_id);

                    if (storeResult?.error) {
                        console.log(storeResult.error);
                        socket.emit("Room_notification", { error: "Something went wrong, please try again later!" });
                        return;
                    }
                }

                // Broadcast the message
                io.to(room_id).emit("recieved_message", {
                    message_id,
                    sent_by,
                    message,
                    room_id,
                    users,
                    sent_at: sent_at || new Date().toISOString()
                });
                return;

            } catch (error) {
                console.error("Error processing message:", error);
                socket.emit("Room_notification", { error: "Internal server error" });

            }
        });

        //emitting notification

        socket.on("send_notification", async (data) => {
            const { user_id, room_code } = data;
            // console.log(data)
            if (!user_id || !room_code) {
                socket.emit("Room_notification", { error: "Some error occurred !" });
                return;
            }
            const room_id = await CheckRoomIdAssociatedWithRoomCode(room_code);
            if (room_id.error || !room_id) {
                console.log(room_id.error)
                socket.emit("Room_notification", { error: "Some error occurred !" });
                return { error: "Unable to store the message" }
            }

            const notification_type = 'Room-joining-request'

            const { data: notifications, error } = await supabase.from("notifications").select("*").eq("user_id", room_id.created_by);

            if (error) {
                console.log(error)
                socket.emit("Room_notification", { error: "Some error occurred !" });
                return { error: "Unable to store the message" }
            }
            io.to(room_id.created_by).emit("new_Notification", notifications);
            return;
        })

        socket.on("disconnect", () => {
        });
    });
}


export const getIo = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized. Call initializeSocketIo first.");
    }
    return io;
};

// find who is the admin of that room


//function to store message in the database 

const StoreMessage = async (sent_by, message, room_id, message_id) => {
    try {
        if (!sent_by || !message || !room_id) {
            return { error: "All parameters are required" };
        }
        // the one who sent the message
        let final_sent_by = sent_by;

        if (sent_by === 'EUREKA' || sent_by === 'SYSTEM') {
            final_sent_by = null;
        }


        const { error } = await supabase.from("room-chat-history").insert({ sent_by: final_sent_by, message: message, room_id: room_id, message_id: message_id })
        if (error) {
            console.log(error)
            return { error: "Unable to store the message" }
        }
        return { message: "Stored" }
    } catch (error) {
        console.error(error);
        return { error: error };
    }
}

//check for any updates from the notification table

async function CheckRoomIdAssociatedWithRoomCode(room_code) {
    try {
        const { data, error } = await supabase.from("chat_rooms").select("room_id,created_by").eq("Room_Joining_code", room_code).single();

        if (error) {
            console.log(error)
            return { error: "No new notifications" };
        }

        return data;
    } catch (error) {
        console.error(error);
        return { error };
    }
}