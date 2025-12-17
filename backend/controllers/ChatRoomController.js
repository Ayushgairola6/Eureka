import { redisClient } from "../CachingHandler/redisClient.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import {
  formatForGemini,
  FormatForHumanFallback,
  SearchQueryResults,
} from "../OnlineSearchHandler/WebSearchHandler.js";
import {
  CHATROOM_IDENTIFIER_PROMPT,
  CHATROOM_SYNTHESIS_PROMPT,
  IDENTIFIER_PROMPT,
  KNOWLEDGE_DISTRIBUTOR_PROMPT,
} from "../Prompts/Prompts.js";
import {
  CentralFunctionProcessor,
  ExeCuteContextEngines,
} from "../Synthesis/Identifier.js";
import {
  getIo,
  UpdateTheRoomChatCache,
} from "../websocketsHandler.js/socketIoInitiater.js";
import { index } from "./fileControllers.js";
import {
  genAI,
  GenerateResponse,
  HandleSummarizationOfChats,
  SynthesisResponseGenerator,
} from "./ModelController.js";
import { supabase } from "./supabaseHandler.js";
import { v4 as uuidv4 } from "uuid";
import { ProcessUserQuery } from "./UserCreditLimitController.js";
import { cp } from "fs";

// string type validator
const IsAString = (value) => {
  try {
    if (value && typeof value === "string") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return { error };
  }
};

const now = new Date();
const hour = now.getHours();
const minute = now.getMinutes();

// Array of month names for clarity
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
// Array of day names
const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const dayOfMonth = now.getDate();
const dayOfWeek = dayNames[now.getDay()];
const year = now.getFullYear();
const month = monthNames[now.getMonth()];

// Format time in 12-hour format with AM/PM
const formattedTime = `${hour > 12 ? hour - 12 : hour}:${minute
  .toString()
  .padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;

// Combine all parts into a single string using a delimiter
const currentTime = `${formattedTime}|${dayOfMonth} ${month} ${year}|${dayOfWeek}`;
// Generate Random RoomCode
function generate6DigitCode() {
  // Create a typed array to hold 3 bytes (24 bits)
  const byteArray = new Uint8Array(3);

  // Fill with cryptographically secure random values
  crypto.getRandomValues(byteArray);

  // Convert bytes to number (0-16777215)
  const num =
    ((byteArray[0] << 16) | (byteArray[1] << 8) | byteArray[2]) % 1000000; // Ensure number is 0-999999

  // Pad with leading zeros to ensure 6 digits
  return num.toString().padStart(6, "0");
}

// To handle a new chat room creation
export const CreateChatRooms = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const user_name = req.user.username;
    const IsPremiumUser = req.user.PaymentStatus;
    if (IsPremiumUser === undefined) {
      return res.status(400).send({
        message:
          "Please log out and Log In again to be able to access new features",
      });
    }
    if (
      !user_id ||
      !user_name ||
      typeof user_id !== "string" ||
      typeof user_name !== "string"
    ) {
      return res.status(400).send({ message: "Please Login to continue" });
    }

    const { Room_name, participant_count, Room_type, Description } = req.body;

    if (
      !Room_name ||
      !participant_count ||
      !Room_type ||
      !Description ||
      !IsAString(Room_name) ||
      typeof participant_count !== "number" ||
      !IsAString(Room_type) ||
      !IsAString(Description)
    ) {
      return res.status(400).send({ messaeg: "Invalid arguments type" });
    }

    //checking the user payment status and based on that allowing chat Rooms with only 2 members worth limit
    if (IsPremiumUser === false) {
      // if the user is not a paid member
      const { data, error } = await supabase
        .from("chat_rooms")
        .select("created_by")
        .eq("user_id", user_id)
        .single();

      if (error) {
        return res.status(400).send({ message: "Something went wrong." });
      }
      // if the user already has a room
      if (data.created_by) {
        return res.status(403).send({
          message: "On the free tier you can not create more than 1 more room.",
        });
      } else if (Room_type === "Private") {
        return res.status(400).send({
          message:
            "We currently only allow premium users to create private rooms.",
        });
      } else if (participant_count > 2) {
        return res.status(400).send({
          message:
            "On free tier you can only create a room with 2 participants worth limit.",
        });
      }
    }

    // creating a unique room id
    const Room_id = `Name=${Room_name.trim()}_unique-id=${uuidv4()}_created-by=${user_name.trim()}`;

    // generating a six digit unique room joining code
    const Room_Joining_code = generate6DigitCode();

    if (!Room_Joining_code) {
      return res
        .status(400)
        .send({ message: "Error while assigning your room a code" });
    }
    // Inserting the data in the database
    const { error } = await supabase.from("chat_rooms").insert({
      room_id: Room_id,
      room_name: Room_name,
      room_type: Room_type,
      participant_count: Number(participant_count),
      Room_Description: Description,
      Room_Joining_code: Number(Room_Joining_code),
      created_by: user_id,
    });

    if (error) {
      await notifyMe("Something went wrong while creating a chatRoom", error);

      return res
        .status(400)
        .send({ message: "Error while processing your request " });
    }
    // update the room and members table as well to insert a new member
    const { error: memberAddingError } = await supabase
      .from("Room_and_Members")
      .insert({ member_id: user_id, room_id: Room_id });

    if (memberAddingError) {
      return res
        .status(403)
        .send({ message: "Error while processing your request " });
    }
    return res.status(200).send({ message: "Room created Successfully !" });
  } catch (roomcreationError) {
    await notifyMe("Room creation controller error", roomcreationError);
    return res.status(500).send({ message: "Internal server error" });
  }
};

// Joining a room

export const JoinARoom = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    if (!user_id || typeof user_id !== "string") {
      return res.status(400).send({ message: "Please Login to continue" });
    }
    const JoiningCode = req.params.joiningCode;

    if (!JoiningCode) {
      return res.status(401).send({
        message: "A room code is necessary in order to join any room!",
      });
    }

    // looking for the room with which the code is associated
    const { data, error } = await supabase
      .from("chat_rooms")
      .select("room_id,room_type")
      .eq("Room_Joining_code", JoiningCode)
      .single();
    if (!data || data.length === 0 || error) {
      return res.status(404).send({ message: "No such room found" });
    }
    const roomId = data.room_id;
    // check if there is even space left in this room if true only then continue
    const checkLimit = await checkRoomMemberLimit(roomId);
    if (checkLimit.error) {
      console.error(checkLimit.error);
      return res.status(400).send({ message: checkLimit.error });
    } else if (checkLimit.message === "Room-full") {
      return res.send({ message: "This room is already full !" });
    }

    // if the user is already in that room
    const { data: existingMembers, error: existingError } = await supabase
      .from("Room_and_Members")
      .select("member_id")
      .eq("member_id", user_id)
      .eq("room_id", roomId);

    if (existingError) {
      console.warn(existingError);
      return res
        .status(500)
        .send({ message: "Error checking room membership." });
    }
    // console.log('room type is',data.room_type)

    // 3. The `existingMembers` array will be empty if the user is not in the room.
    if (existingMembers.length > 0) {
      return res.status(400).send({ message: "Cannot join a room twice!" });
    }
    // if room is private so we will send the notification to the users who is the admin of the room else we wiill add them to the room

    if (data.room_type === "private") {
      const notification_type = "room_joining_request";
      const notify = await SendJoinNotification(
        user_id,
        roomId,
        notification_type
      );
      if (notify.error) {
        return res.status(400).send({ message: notify.error });
      }

      return res.send({ message: notify.message });
    }

    //    adding the user in that room if the room is not private so it automatically makes it public
    const join = await JoinTheUser(data.room_id, user_id);
    if (join.error) {
      return res.status(403).send({ message: "Error while Joining this room" });
    }
    return res.status(200).send({ message: join.message });
  } catch (RoomJoinError) {
    // console.log(RoomJoinError);
    return res.status(500).send({ message: "Internal server error" });
  }
};

// add the user in that room
export const JoinTheUser = async (room_id, user_id) => {
  try {
    // if user already exists in that room
    const { data, error } = await supabase
      .from("Room_and_Members")
      .select("member_id")
      .eq("member_id", user_id)
      .eq("room_id", room_id)
      .single();

    if (error && error.code !== "PGRST116") {
      // 'PGRST116' means 'no rows found'
      // This is a real database error, so we should warn and return an error.
      // console.warn(error);
      return { error: "Database error while checking membership" };
    }

    // Check if the user was found (data is not null).
    if (data) {
      // User already exists, so prevent them from joining again.
      return { error: "The user is already in the room!" };
    }

    // If the user is not in the room, add them.
    const { error: JoiningError } = await supabase
      .from("Room_and_Members")
      .insert({ room_id: room_id, member_id: user_id })
      .select();

    if (JoiningError) {
      // console.warn(JoiningError);
      return { error: "Error while joining this room" };
    }
    // fetch data to update the caceh of the user
    const { data: chatrooms, error: chatRoomError } = await supabase
      .from("Room_and_Members")
      .select("member_id, room_id, chat_rooms(*)")
      .eq("member_id", user_id);

    if (chatRoomError) {
      console.error("error while updating the users cache");
    }
    const key = `user_id=${user_id}'s_dashboardData`;

    const exists = await redisClient.exists(key);
    //if the users cache is available update that too
    if (exists) {
      await redisClient.hSet(key, "chatrooms", JSON.stringify(chatrooms));
    }

    return { message: "Room joined successfully" };
  } catch (error) {
    return { error };
  }
};
//send room_joining_request
export const SendJoinNotification = async (
  user_id,
  room_id,
  notification_type
) => {
  try {
    // find the person who is the owner of the room
    const { data: admins, error: adminError } = await supabase
      .from("chat_rooms")
      .select("created_by,room_name")
      .eq("room_id", room_id)
      .single();
    // console.log(admins)

    if (adminError) {
      console.error("Error fetching room admins:", adminError);
      return { error: "Error while processing your request" };
    }

    if (!admins || admins.length === 0) {
      return { error: "No administrators found for this room" };
    }

    // Get requesting user's info
    const { data: requestingUser, error: userError } = await supabase
      .from("users")
      .select("id,username, email")
      .eq("id", user_id)
      .single();

    if (userError) {
      console.error("Error fetching user info:", userError);
      return { error: "Error while processing your request" };
    }

    // check if the notification has already been sent
    const { data: check, error: checkerror } = await supabase
      .from("notifications")
      .select("metadata")
      .eq("user_id", admins.created_by)
      .eq("notification_type", notification_type);

    if (checkerror) {
      console.error(checkerror);

      return { error: "Error while processing your request" };
    } else if (check.length > 0) {
      const existingRequest = check.find(
        (element) =>
          element.metadata?.room_id === room_id &&
          element.metadata?.sent_by_id === user_id
      );

      if (existingRequest) {
        return { message: "Room joining request has been sent already!" };
      }
    }

    // creating a metadata object
    const metadata = {
      room_id: room_id,
      room_name: admins.room_name,
      sent_by_username: requestingUser.username,
      sent_by_id: requestingUser.id,
    };
    // add a new notification
    const { data: newNotification, error: insertError } = await supabase
      .from("notifications")
      .insert({
        user_id: admins.created_by,
        notification_type: notification_type,
        notification_message: `${requestingUser.username} wants to join your room`,
        title: "Room-joining-request",
        metadata: metadata,
      })
      .select("*");

    if (insertError) {
      console.error(insertError);
      return { error: "Error while processing your request" };
    }
    const io = getIo();
    const { data: adminNotifications, errro: geterror } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", admins.created_by);
    if (geterror) {
      io.to(admins.created_by).emit("new_Notification", {
        message: "Unable to update your notifications",
      });
    }
    io.to(admins.created_by).emit("new_Notification", adminNotifications);
    // io.to(user_id).emit("new_Notification")
    return { message: "The admin of the room has been notified !" };
  } catch (error) {
    console.log(error);
    return { error: "Error while processing the request" };
  }
};

// check member limit
export const checkRoomMemberLimit = async (room_id) => {
  try {
    // Get room participant limit
    let pariticipantCount;
    const RoomParticipantLimitCacheKey = `room=${room_id}'s_participantCount`;
    const CacheLimit = await redisClient.get(RoomParticipantLimitCacheKey);
    // if the participant count is cached
    if (CacheLimit) {
      pariticipantCount = JSON.parse(CacheLimit);
    } else {
      // get the linit from the db and cache it
      const { data: room, error: roomError } = await supabase
        .from("chat_rooms")
        .select("participant_count")
        .eq("room_id", room_id)
        .single();

      if (roomError) return { error: "Error fetching room details" };

      pariticipantCount = room.participant_count;
      await redisClient.set(
        RoomParticipantLimitCacheKey,
        JSON.stringify(room.participant_count)
      );
    }

    // Get current member count
    const { count: currentCount, error: countError } = await supabase
      .from("Room_and_Members")
      .select("*", { count: "exact", head: true })
      .eq("room_id", room_id);

    if (countError) return { error: "Error counting room members" };

    // Check if room is full
    if (currentCount >= pariticipantCount) {
      return { message: "Room-full" };
    }

    return { message: "Space-available" };
  } catch (error) {
    console.error("Room limit check error:", error);
    return { error: "Internal server error" };
  }
};
//Get room chat history

export const GetRoomChatHistory = async (req, res) => {
  try {
    const user_id = req.user;
    const IsPremiumUser = req.user.PaymentStatus;
    if (!user_id)
      return res.status(400).send({ message: "Please login to continue" });
    const room_id = req.params.room_id;
    if (!room_id) return res.status(400).send({ message: "Invalid room id" });

    const RoomChatKey = `room_id=${room_id}'s_chat-history`;
    // await redisClient.del(RoomChatKey);
    //if cache exists
    const exists = await redisClient.exists(RoomChatKey);
    let limit = req.user.PaymentStatus === true ? 15 : 10;
    if (exists) {
      const ChatHistory = await redisClient.lRange(RoomChatKey, -5, -1); //always recent messages
      const parsedChats = ChatHistory.map((jsonString) => {
        try {
          // Parse each individual string element
          return JSON.parse(jsonString);
        } catch (error) {
          console.error("Error parsing JSON message:", jsonString, error);
          // Return a placeholder or handle the error as needed
          return re.status(400).send({ error: "Parse Error", data: [] });
        }
      });

      // console.log(parsedChats);
      return res.status(200).send({ chats: parsedChats });
    }

    //retrieve the chats from the db and cache it then send it;
    const { data, error } = await supabase
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
      return res.status(200).send({ chats: [], message: "No messages found" });
    }

    if (error) {
      return res.status(400).send({ message: "Unable to read older messages" });
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

    return res.send({ chats: SortedResults });
  } catch (error) {
    await notifyMe("GetRoommChatHistory controller error", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};
//handles fetchign more messages
export const FetchMoreMessages = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).send({ message: "Please login to continue" });
    }
    const { room_id, time_value, MessageId, index } = req.body;
    if (
      !room_id ||
      !time_value ||
      typeof room_id !== "string" ||
      typeof time_value !== "string" ||
      !MessageId ||
      typeof MessageId !== "string" ||
      !index
    ) {
      // console.log(req.body);
      return res.status(400).send({ message: "Invalid arguments" });
    }

    if (user.PaymentStatus === false) {
      return res.status(200).send({
        message:
          "Currently only premium members are allowed to fetch previous chats",
      });
    }
    const RoomChatKey = `room_id=${room_id}'s_chat-history`;
    // we check the oldest messaeg in the cache
    const oldestCacheCheck = await redisClient.lRange(RoomChatKey, 0, 0);
    if (oldestCacheCheck && oldestCacheCheck.length > 0) {
      const cachedOldest = JSON.parse(oldestCacheCheck[0]);
      // console.log(cachedOldest, time_value);

      // If Cache Time < Client Time, the cache has older history!
      if (
        cachedOldest.created_at < time_value ||
        (cachedOldest.created_at === time_value &&
          cachedOldest.message_id < MessageId)
      ) {
        // 4. Retrieve the history
        // Since we don't know exactly "where" the client's message is in the list,
        // and Redis lists are usually small (100-200 items), fetching the whole list
        // and filtering is often faster than doing a linear search in Redis.

        const fullCache = await redisClient.lRange(RoomChatKey, 0, -1);
        const parsedCache = fullCache.map(JSON.parse);

        // Filter to return only messages OLDER than the client's anchor
        const olderMessages = parsedCache.filter((msg) => {
          return (
            msg.created_at < time_value ||
            (msg.created_at === time_value && msg.message_id < MessageId)
          );
        });

        // Send these back!
        return res
          .status(200)
          .send({ message: "Found older messages", history: olderMessages });
      }
    }

    // // return;
    // //then go to the database
    const { data, error } = await supabase
      .from("room-chat-history")
      .select(
        `
        message, sent_at, sent_by, room_id, message_id, created_at,
        users!sent_by (username)
    `
      )
      .eq("room_id", room_id)

      // 1. Order by timestamp ASC (Oldest first)
      .order("created_at", { ascending: false })
      // 2. Order by message_id ASC (Tie-breaker)
      .order("message_id", { ascending: false })
      .lt("created_at", time_value)
      // .lt("message_id", MessageId)
      .limit(1);

    if ((data && data?.length === 0) || error) {
      return res.status(404).send({ message: "No older messages found" });
    }

    const sortedChats = [...data].reverse(); //sort the array;

    //update the cache if the messages are new
    const StringifiedMessages = sortedChats.map((li) => JSON.stringify(li)); //strigify the values
    //update the cache
    await redisClient
      .multi()
      .exists(RoomChatKey)
      .lPush(RoomChatKey, StringifiedMessages) //as the messages are older, we we push it in reversed mode behind the oler message which is at the head of the list
      .exec();

    return res
      .status(200)
      .send({ message: "Found older messages", history: sortedChats });
  } catch (error) {
    console.error(error);
    await notifyMe("An erro while fetching more messages");
    return res.status(500).send({ message: "Internal server error" });
  }
};
// get document specific chat history

export const GetDocumentChatHistory = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const IsPremiumUser = req.user.PaymentStatus;

    if (!user_id)
      return res.status(400).send({ message: "Please login to continue" });

    if (IsPremiumUser === false) {
      return res.staus(403).send({
        message: "You need an active subscription to access this feature.",
      });
    }
    const document_id = req.params.document_id;
    if (!document_id)
      return res.status(400).send({ message: "Invalid document_id " });

    const DocumentChatCacheKey = `document=${document_id}'s_chat-history`;
    const CachedDocChats = await redisClient.get(DocumentChatCacheKey);
    if (CachedDocChats) {
      return res.status(200).send(JSON.parse(CachedDocChats));
    }
    const { data, error } = await supabase
      .from("Conversation_History")
      .select("created_at,question,AI_response")
      .eq("document_id", document_id)
      .eq("user_id", user_id);

    if (error) {
      console.error(error);
      return res.status(404).send({ message: "No such room found" });
    }

    if (data.length !== 0) {
      await redisClient.set(DocumentChatCacheKey, JSON.stringify(data), {
        expiration: {
          type: "EX",
          value: 1500,
        },
      });
    }

    return res.send(data);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

// get misallaneous chat history for all the asked questions by the user related to non category specific domains and subdomains

export const GetMisallaneousChatHistory = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    // const IsPremiumUser = req.user.PaymentStatus;

    if (!user_id) {
      return res.status(402).send({ message: "Please login to continue" });
    }

    // 1. Get the cursor (timestamp of the last fetched chat) from the request query
    const cursor = req.query.cursor; // Expecting an ISO date string, e.g., from the client's previous request
    const limit = 5; // Define your limit

    let { data, error } = await supabase
      .from("Conversation_History")
      .select(" created_at, question, AI_response,metadata")
      .eq("user_id", user_id)
      .is("document_id", null)
      .order("created_at", { ascending: false }) // Order newest first
      .limit(limit);

    // results older than current timestamp
    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    // const { data, error } = await query;

    if (error) {
      await notifyMe(
        `Error while getting misallaneous chats by user=${req.user.username}: ${error}`
      );
      return res
        .status(404)
        .send({ message: "Error while loading chat history" });
    }

    // 3. The new cursor for the next page is the `created_at` of the oldest record in this batch
    let nextCursor = null;
    if (data && data.length > 0) {
      nextCursor = data[data.length - 1].created_at;
    }

    // 4. Send the data and the next cursor to the client
    return res.send({
      message: data.length > 0 ? "Chats found" : "No more chats",
      data: data,
      nextCursor: nextCursor,
      hasMore: data.length === limit,
    });
  } catch (err) {
    console.error(err);
    await notifyMe(`"Error while getting miscellaneous chats:", ${err}`);
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

export const QueryDocWithEurekaInChatRoom = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const IsPremiumUser = req.user.PaymentStatus;
    const io = getIo();

    if (!userId)
      return res.status(401).send({ message: "Please login to continue" });

    const { question, room_id, user_id, document_id, MessageId } = req.body;
    if (
      !question ||
      !room_id ||
      !user_id ||
      !document_id ||
      typeof question !== "string" ||
      typeof room_id !== "string" ||
      typeof user_id !== "string" ||
      typeof document_id !== "string"
    ) {
      return res.status(400).send({ message: "Some fields are missing" });
    }

    // if user is not a paid member
    if (IsPremiumUser === false) {
      if (io) {
        io.to(room_id).emit("recieved_message", {
          message_id: MessageId,
          sent_by: null,
          message: `${
            req.user.username || "User"
          } needs to have an active subscription in order to be able to use Eureka AI in a chat room.`,
          room_id: room_id,
          users: { username: "EUREKA" },
          sent_at: currentTime || new Date().toISOString(),
        });
      }
      return res.status(200).send({
        answer:
          "You need to have an active subscription in order to be able to use Eureka AI in a chat room.",
      });
    }
    // check for matching results from db
    const DbResults = await index.searchRecords({
      query: {
        topK: req.user.PaymentStatus === true ? 200 : 100,
        inputs: { text: question },
        filter: {
          documentId: { $eq: document_id },
          visibility: { $eq: "Private" },
        },
      },
      fields: ["text"],
    });

    if (DbResults.result.hits.length === 0) {
      return res.status(200).send({
        answer:
          "I was unable to find anything related to you question in your document . If you could be more specific about what you want to know about this document I will be able to assist you properly.",
      });
    }

    const FoundInformation = [];
    DbResults.result.hits.forEach((rest) => {
      if (rest._score && rest.fields.text) {
        FoundInformation.push({ _score: rest._score, text: rest.fields.text });
      }
    });

    const AnswerToQuestion = await GenerateResponse(
      question,
      FoundInformation,
      process.env.SYSTEM_PROMPT
    );

    if (!AnswerToQuestion || AnswerToQuestion.error) {
      return res.status(400).send({
        message:
          "Error while generating a response the server is very busy right now !",
      });
    }
    //     const AnswerToQuestion = `# Testing Broadcast System

    // This is a **test message** to check the broadcast functionality across the chat room.

    // ## Features to Test:
    // - ✅ **Real-time delivery** to all users
    // - ✅ **Markdown rendering** in messages
    // - ✅ **Message formatting** and styling
    // - ✅ **Different sender types** (User, System, Eureka)

    // ### Code Block Test:
    // \`\`\`javascript
    // const message = {
    //   id: "test_123",
    //   content: "Hello from broadcast!",
    //   timestamp: new Date().toISOString(),
    //   sender: "SYSTEM"
    // };
    // \`\`\`

    // ### List Test:
    // - Item 1 with *italic*
    // - Item 2 with **bold**
    // - Item 3 with ~~strikethrough~~

    // ### Table Test:
    // | Feature | Status | Notes |
    // |---------|--------|-------|
    // | Real-time | ✅ Working | Socket.io |
    // | Markdown | ✅ Rendered | Streamdown |
    // | Styling | ✅ Applied | Tailwind |

    // > This is a blockquote testing the broadcast system across all connected clients in the room.

    // **Message ID:** ${Date.now()}
    // **Room:** ${Math.random().toString(36).substr(2, 9)}
    // `;

    // broadcast the message to the room so that the message is synchrnus

    if (io) {
      io.to(room_id).emit("recieved_message", {
        message_id: MessageId,
        sent_by: null,
        message: AnswerToQuestion,
        room_id: room_id,
        users: { username: "EUREKA" },
        sent_at: currentTime || new Date().toISOString(),
      });
    }

    // sote the messagein the db
    const { error } = await supabase.from("room-chat-history").insert({
      sent_by: null,
      message: AnswerToQuestion,
      room_id: room_id,
      message_id: MessageId,
      sent_at: currentTime || new Date().toISOString(),
    });
    if (error) {
      await notifyMe(
        `An error occured of critical level occured when storing chat history in the db at ${currentTime}`
      );
    }
    // update the cache for EUREKA
    await UpdateTheRoomChatCache(
      room_id,
      AnswerToQuestion,
      currentTime || new Date().toISOString,
      null,
      { username: "EUREKA" }
    );
    return res.status(200).send({ answer: AnswerToQuestion });
  } catch (error) {
    return res.satus(500).send({ message: "Something went wrong" });

    await notifyMe(error);
  }
};
//web search handler for rooms
export const QueryWebInEurekaChatRoom = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const io = getIo();

    if (!user_id) {
      return res.status(401).send({ message: "Please login to continue" });
    }

    const { room_id, MessageId, query } = req.body;

    if (!room_id || !MessageId || !query) {
      await notifyMe("Something is wrong in the chatRoomWebSearchHandler");
      return res.status(400).send({ message: "Something went wrong" });
    }
    const webResults = await SearchQueryResults(query.trim(), req.user);
    if (!webResults || webResults.error) {
      await notifyMe("web search error", webResults.error);

      return res.status(400).send({ message: "Something went wrong" });
    }

    let Formattedresult = formatForGemini(webResults.response);
    if (!Formattedresult) {
      // console.log(Formattedresult);
      return res.status(400).send({
        message:
          "There are many users using our service right now, that is why I am having issues while processing your request right now. I want apologize for the inconvenience. If this issue presists you can contact the support team.",
      });
    }

    const ChatHistory = await ExtractChatHistory(room_id, req.user);
    if (ChatHistory && ChatHistory.length > 0) {
      ChatHistory.map(
        (li, i) => (Formattedresult += `index=${i}&content=${li}`)
      );
    }
    // creating  response for the user
    let AnswerToQuestion = await GenerateResponse(
      query,
      Formattedresult,
      WEB_SEARCH_DISTRIBUTOR_PROMPT,
      req.user.PaymentStatus
    );

    if (!AnswerToQuestion || AnswerToQuestion.error) {
      // AnswerToQuestion = FormatForHumanFallback(webResults.response).text;
      return res.status(400).send({
        message:
          "There are many users using our service right now, that is why I am having issues while processing your request right now. I want apologize for the inconvenience. If this issue presists you can contact the support team. ",
      });
    }
    // emitting the response throughout the room
    if (io) {
      io.to(room_id).emit("recieved_message", {
        message_id: MessageId,
        sent_by: null,
        message: AnswerToQuestion,
        room_id: room_id,
        users: { username: "EUREKA" },
        sent_at: currentTime || new Date().toISOString(),
      });
    }
    // store the message in the db
    const { error } = await supabase.from("room-chat-history").insert({
      sent_by: null,
      message: AnswerToQuestion,
      room_id: room_id,
      message_id: MessageId,
      sent_at: currentTime || new Date().toISOString(),
    });
    if (error) {
      await notifyMe(
        `An error occured of critical level occured when storing chat history in the db at ${currentTime}`
      );
    }
    // update the cache for EUREKA
    await UpdateTheRoomChatCache(
      room_id,
      AnswerToQuestion,
      currentTime || new Date().toISOString,
      null,
      { username: "EUREKA" }
    );
    const FormattedFavIcon = {
      MessageId: MessageId,
      favicon: webResults.favicon || [],
    };
    return res.send({
      answer: AnswerToQuestion,
      favicon: FormattedFavIcon,
    });
    // console.log(Formattedresult);
    return;
  } catch (error) {
    console.error(error);
    await notifyMe("Error in quey web in chatRoomController.js", error);

    return res.status(500).send({ message: "Something went wrong" });
  }
};

export const GetSyntheSizedResults = async (req, res) => {
  try {
    const user = req.user;
    const io = getIo();
    if (!user) {
      return res.status(401).send({ message: "Please log in to continue" });
    }
    const { question, documents, room_id, user_id, MessageId } = req.body;
    if (!question || !documents || !room_id || !user_id || !MessageId) {
      // console.log(req.body);
      return res.status(400).send({ message: "Some fields are missing" });
    }

    //process the request and gather context
    const ProcessQuery = await IdentifyRequestInputs(
      user,
      question,
      documents,
      room_id
    );

    if (!ProcessQuery?.SynthesizedResponse) {
      return res.status(400).send({
        message: "I was unable to proceed with your request at the moment!",
      });
    }
    if (io) {
      io.to(room_id).emit("recieved_message", {
        message_id: MessageId,
        sent_by: null,
        message: ProcessQuery?.SynthesizedResponse,
        room_id: room_id,
        users: { username: "EUREKA" },
        sent_at: currentTime || new Date().toISOString(),
      });
    }
    // store the message in the db
    const { error } = await supabase.from("room-chat-history").insert({
      sent_by: null,
      message: ProcessQuery?.SynthesizedResponse,
      room_id: room_id,
      message_id: MessageId,
      sent_at: currentTime || new Date().toISOString(),
    });
    if (error) {
      await notifyMe(
        `An error occured of critical level occured when storing chat history in the db at ${currentTime}`
      );
    }
    const RateLimit = await ProcessQuery(user, "Synthesis");
    if (RateLimit.status.trim().toLowerCase().includes("not ok")) {
      return res.status(200).send({
        Answer: RateLimit.message,
        message: "Todays quota has finished!",
        docUsed: [],
      });
    }
    // update the cache for EUREKA
    await UpdateTheRoomChatCache(
      room_id,
      ProcessQuery?.SynthesizedResponse,
      currentTime || new Date().toISOString,
      null,
      { username: "EUREKA" }
    );
    return res.send({
      Answer: ProcessQuery?.SynthesizedResponse,
    });
  } catch (synthesisError) {
    console.error(synthesisError);
    await notifyMe(
      "An error occured while creating a synthesized result in a chatroom",
      synthesisError
    );
  }
};

export async function IdentifyRequestInputs(
  user,
  question,
  selectedDocuments,
  room_id
) {
  try {
    let FinalString = `${CHATROOM_IDENTIFIER_PROMPT}_This is the users question=${question}`; //command for the model

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [{ role: "user", parts: [{ text: FinalString }] }],
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        topK: 20,
        maxOutputTokens: 200, ///maximum 300 characters output
      },
    });

    const responseText = result.text;
    //     ask_pr
    // ivate(doc_id="AUTO", query="Analyze and underst
    // and skeptical points in the research report");
    // GetDoc_info(doc_id="AUTO")
    if (!responseText) {
      await notifyMe(
        `Error while generating a response , the code execution results are these`
      );
      return { error: "The server is very busy , please try again !" };
    }

    const io = getIo();
    if (io) {
      io.to(user.user_id).emit("SynthesisStatus", "Dissecting Request");
    }
    const ExtractedFunctions = CentralFunctionProcessor(responseText, io); //clearing the function string
    // console.log(ExtractedFunctions);

    if (ExtractedFunctions.length < 0) {
      return {
        SynthesizedResponse:
          "I was unable to understand your request, if you could be more specific about your requirements, I will be able to process a better response",
      };
    }

    if (io) {
      io.to(user.user_id).emit("SynthesisStatus", "Finding sources");
    }

    //process the query

    const smartExecResult = await ExeCuteContextEngines(
      ExtractedFunctions,
      user,
      selectedDocuments,
      io
    );

    if (!smartExecResult || smartExecResult.message) {
      return {
        SynthesizedResponse: "An error occured while processing your request",
      };
    }
    const PastChats = await ExtractChatHistory(room_id, user);
    if (PastChats.length > 0) {
      smartExecResult.pastConversation = [...PastChats];
    }

    const ModelResponse = await SynthesisResponseGenerator(
      JSON.stringify(smartExecResult),
      question,
      user,
      CHATROOM_SYNTHESIS_PROMPT
    );

    if (ModelResponse.error) {
      return { SynthesizedResponse: ModelResponse.error };
    }

    //incremetn query counter
    const UpdateState = await ProcessUserQuery(user);

    return { SynthesizedResponse: ModelResponse };
  } catch (SynthesisError) {
    console.error(SynthesisError);
    await notifyMe("An error occured in the synthesis hanlder", SynthesisError);
  }
}

//helper function to inject room chat history in in the model context object
async function ExtractChatHistory(room_id, user) {
  const key = `room_id=${room_id}'s_chat-history`;
  const summaryKey = `room_id=${room_id}'s_summarized_history`;
  const summaryExists = await redisClient.exists(summaryKey);

  //if there is summary of room avaialble
  if (summaryExists) {
    const summary = await redisClient.get(summaryExists);
    return JSON.parse(summary);
  }
  const exists = await redisClient.exists(key);

  if (exists) {
    const batchsize = 19;
    const Chats = await redisClient.lRange(key, 0, 20);
    const Parsed = Chats.map((li) => JSON.parse(li)); //fetch latest 20 messages
    // if the messages are late or we have reached batchsize
    const timeOfLastMessage = Parsed[Parsed.length - 1]?.created_at;
    const lastMessageMs = new Date(timeOfLastMessage).getTime();
    const currentMs = Date.now();
    const timeGap = currentMs - lastMessageMs;
    const STALE_THRESHOLD_MS = 60 * 60 * 1000;
    //if the length has reached a number of 10
    if (
      batchsize ||
      timeGap > STALE_THRESHOLD_MS //and the length of array is even number
    ) {
      //create a summary
      const UpsertSummary = await HandleSummarizationOfChats(
        room_id,
        Parsed,
        user
      );
    }
    return Parsed;
  } else {
    const { data, error } = await supabase
      .from("room-chat-history")
      .select(
        `
    message,
    sent_at,
    room_id,
    users!sent_by (username)
  `
      )
      .eq("room_id", room_id)
      .order("created_at", { ascending: true })
      .limit(20);

    if (error) {
      return [];
    }

    const multi = redisClient.multi();
    const chats = data.map((cht) => JSON.stringify(cht));
    multi.rPush(key, chats); //cache the chats
    multi.expire(key, 4000);

    await multi.exec(); //execute all the request
    return data;
  }
}
