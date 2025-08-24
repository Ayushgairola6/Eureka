import { supabase } from './supabaseHandler.js'
import { v4 as uuidv4 } from 'uuid';

// string type validator
const IsAString = (value) => {
    try {
        if (value && typeof value === 'string') {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return { error };
    }
}

// Generate Random RoomCode
function generate6DigitCode() {
    // Create a typed array to hold 3 bytes (24 bits)
    const byteArray = new Uint8Array(3);

    // Fill with cryptographically secure random values
    crypto.getRandomValues(byteArray);

    // Convert bytes to number (0-16777215)
    const num = (
        (byteArray[0] << 16) |
        (byteArray[1] << 8) |
        byteArray[2]
    ) % 1000000; // Ensure number is 0-999999

    // Pad with leading zeros to ensure 6 digits
    return num.toString().padStart(6, '0');
}

// To handle a new chat room creation
export const CreateChatRooms = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const user_name = req.user.username;
        if (!user_id || !user_name || typeof user_id !== 'string' || typeof user_name !== 'string') {
            return res.status(400).send({ message: "Please Login to continue" })
        }
        const { Room_name, participant_count, Room_type, Description } = req.body;

        if (!Room_name || !participant_count || !Room_type || !Description || !IsAString(Room_name) || typeof participant_count !== 'number' || !IsAString(Room_type) || !IsAString(Description)) {
            return res.status(400).send({ messaeg: "Invalid arguments type" });
        }
        // creating a unique room id 
        const Room_id = `Name=${Room_name.trim()}_unique-id=${uuidv4()}_created-by=${user_name.trim()}`;

        // generating a six digit unique room joining code
        const Room_Joining_code = generate6DigitCode();

        if (!Room_Joining_code) {
            return res.status(400).send({ message: "Error while assigning your room a code" });
        }
        // Inserting the data in the database
        const { error } = await supabase.from("chat_rooms").insert({ room_id: Room_id, room_name: Room_name, room_type: Room_type, participant_count: Number(participant_count), Room_Description: Description, Room_Joining_code: Number(Room_Joining_code), created_by: user_id });

        if (error) {
            console.warn(error)
            return res.status(403).send({ message: "Error while processing your request " })
        }
        // update the room and members table as well to insert a new member
        const { error: memberAddingError } = await supabase.from("Room_and_Members").insert({ member_id: user_id, room_id: Room_id });

        if (memberAddingError) {
            return res.status(403).send({ message: "Error while processing your request " })
        }
        return res.status(200).send({ message: "Room created Successfully !" })
    } catch (roomcreationError) {
        console.log(roomcreationError)
        return res.status(500).send({ message: "Internal server error" })
    }

}


// Joining a room

export const JoinARoom = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        if (!user_id || typeof user_id !== 'string') {
            return res.status(400).send({ message: "Please Login to continue" })
        }
        const JoiningCode = req.params.joiningCode;
        // console.log(JoiningCode,req.body,'values from teh client side')
        if (!JoiningCode) {
            return res.status(401).send({ message: "A room code is necessary in order to join any room!" })
        }

        // looking for the room with which the code is associated
        const { data, error } = await supabase.from("chat_rooms").select("room_id,room_type").eq('Room_Joining_code', JoiningCode).single();
        if (data.length === 0 || !data || error) {
            return res.status(404).send({ message: "No such room found" });
        }
        const roomId = data.room_id
        // check if there is even space left in this room if true only then continue
        const checkLimit = await checkRoomMemberLimit(roomId);
        if (checkLimit.error) {
            return res.status(400).send({ message: checkLimit.error });
        } else if (checkLimit.message === "Room-full") {
            return res.send({ message: "This room is already full !" })
        }



        // if the user is already in that room
        const { data: existingMembers, error: existingError } = await supabase
            .from("Room_and_Members")
            .select('member_id')
            .eq('member_id', user_id)
            .eq('room_id', roomId);

        if (existingError) {
            console.warn(existingError);
            return res.status(500).send({ message: "Error checking room membership." });
        }

        // 3. The `existingMembers` array will be empty if the user is not in the room.
        if (existingMembers.length > 0) {
            return res.status(400).send({ message: "Cannot join a room twice!" });
        }
        // if room is private so we will send the notification to the users who is the admin of the room else we wiill add them to the room
        else if (data.room_type === "Private") {
            const notify = await SendJoinNotification(user_id, roomId);
            if (notify.error) {
                return res.status(400).send({ message: notify.error });
            }

            return res.send({ message: notify.message });
        }

        //    adding the user in that room if the room is not private so it automatically makes it public
        const { error: JoiningError } = await supabase.from("Room_and_Members").insert({ room_id: data.room_id, member_id: user_id });
        if (JoiningError) {
            console.warn(JoiningError)
            return res.status(403).send({ message: "Error while Joining this room" });
        }

        return res.status(200).send({ message: "Room joined successfully" });
    } catch (RoomJoinError) {
        console.log(RoomJoinError);
        return res.status(500).send({ message: "Internal server error" })
    }
}

//send room_joining_request
const SendJoinNotification = async (user_id, room_id) => {
    try {
        //see if the notifcation has already has been sent
        const { data, error } = await supabase.from("room_joining_notification").select("user_id,room_id").eq("user_id", user_id).eq("room_id", room_id).single();

        if (error) {
            return { error: "Error while processing your request" }
        }
        if (data) {
            return { message: "Request has already been sent!" }
        }

        // else store the notification value in the database
        const { error: notifyError } = await supabase.from("room_joining_notification").insert({ user_id: user_id, room_id: room_id });

        if (notifyError) {
            return { error: "Error while sending a request" };
        }
        return { message: "The admin of the room has been notified !" }

    } catch (error) {
        console.log(error)
        return { error: "Error while processing the request" }
    }
}

// check member limit
const checkRoomMemberLimit = async (room_id) => {
    try {
        const { data: limit, error: limitError } = await supabase.from("chat_rooms").select("participant_count").eq("room_id", room_id).single();
        if (limitError) {
            return { error: 'error while processing your request' };
        }
        if (limit.participant_count < 3) {
            return { message: "Space-left" }
        } else {
            return { message: "Room-full" };
        }
    } catch (error) {
        console.error(error);
        return { error };
    }
}
//Get room chat history

export const GetRoomChatHistory = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        if (!user_id) return res.status(400).send({ message: "Please login to continue" });
        const room_id = req.params.room_id;
        if (!room_id) return res.status(400).send({ message: "Invalid room id" });

        const { data, error } = await supabase.from("room-chat-history").select(`
    message,
    sent_at,
    sent_by,
    room_id,
    users!sent_by (username)
  `).eq("room_id", room_id)
            .order("sent_at", { ascending: true });

        if (!data || data.length === 0) {
            return res.status(200).send({ chats: [], message: "No messages found" });
        }

        if (error) {
            return res.status(400).send({ message: "Unable to read older messages" });
        }
        return res.send({ chats: data });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal server error" });
    }
}


// get document specific chat history

export const GetDocumentChatHistory = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        if (!user_id) return res.status(400).send({ message: "Please login to continue" });
        const document_id = req.params.document_id;
        if (!document_id) return res.status(400).send({ message: "Invalid document_id " });

        const { data, error } = await supabase.from("Conversation_History").select("created_at,question,AI_response,user_id").eq("document_id", document_id).eq("user_id", user_id);

        console.log(data)
        if (error) {
            console.error(error);
            return res.status(404).send({ message: "No such room found" });
        }

        return res.send(data);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Internal server error" });
    }
}