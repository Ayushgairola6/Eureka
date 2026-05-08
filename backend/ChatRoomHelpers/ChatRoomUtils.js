import { redisClient } from "../CachingHandler/redisClient.js";
import { supabase } from "../controllers/supabaseHandler.js";

// extracts chat history for room--llm history injection
export async function GetRoomChatsForContext(room_data) {
  try {
    const { room_id, plan_type } = room_data;
    if (!room_id) return { error: "Invalid room id", history: [] };

    const RoomChatKey = `room_id=${room_id}'s_chat-history`;

    //if cache exists
    const exists = await redisClient.exists(RoomChatKey);
    let limit = plan_type === "free" || plan_type === "sprint pass" ? 4 : 10;
    if (exists) {
      const ChatHistory = await redisClient.lRange(RoomChatKey, -5, -1); //always recent messages
      const parsedChats = ChatHistory.map((jsonString) => {
        try {
          // Parse each individual string element
          return JSON.parse(jsonString);
        } catch (err) {
          // Return a placeholder or handle the error as needed
          return { error: "Parse Error", history: [] };
        }
      });

      // console.log(parsedChats);
      return { history: parsedChats, error: null };
    }

    //retrieve the chats from the db and cache it then send it;
    const { data, error: dbError } = await supabase
      .from("room-chat-history")
      .select(
        `
      message,
      sent_at,
      sent_by,
      room_id,
      message_id,
      users!sent_by (username),created_at
    `
      )
      .eq("room_id", room_id)
      .order("created_at", { ascending: false })
      .limit(limit);

    // console.log(data);
    //fetches the chat_history from latest to oldest
    if (!data || data.length === 0) {
      return { history: [], error: "No messages found" };
    }

    if (dbError) {
      return { error: "Unable to read older messages", history: [] };
    }

    // cache the chats

    const SortedResults = [...data].reverse();
    const stringifiedResults = SortedResults.map((chat) =>
      JSON.stringify(chat)
    );
    const multi = redisClient.multi();
    redisClient.rPush(RoomChatKey, stringifiedResults); //add it into end of the list the
    multi.expire(RoomChatKey, 4000); // 4000 seconds

    await multi
      .exec()
      .then()
      .catch(async (error) => {
        if (error) {
          await notifyMe("An error while caching room_chat history", error);
        }
      });

    return { history: SortedResults, error: null };
  } catch (error) {
    await notifyMe("GetRoommChatHistory controller error", error);
    return { error: "Internal server error", history: [] };
  }
}
