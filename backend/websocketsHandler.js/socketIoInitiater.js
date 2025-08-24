import { supabase } from '../controllers/supabaseHandler.js';
import httpServer from '../index.js'
import { Server } from 'socket.io';

export const initializeSocketIo = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*"
        }
    });
    const Room_And_their_members = new Map();
    // connecting with the websocket connection
    io.on("connection", (socket) => {
        // joining a specific chatRoom
        socket.on("Joining_a_chat_room", (room_information) => {

            const { username, room_id, room_name } = room_information;
            if (!room_id || !room_name || !username) {
                socket.emit("Room_notification", { error: 'An error occured while trying to joining the room' });
                return;
            }
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
            console.log(membername)
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
            } catch (error) {
                console.error("Error processing message:", error);
                socket.emit("Room_notification", { error: "Internal server error" });
            }
        });

        socket.on("disconnect", () => {
        });
    });
};


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