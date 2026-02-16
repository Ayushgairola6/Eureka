import { redisClient } from "../CachingHandler/redisClient.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";

import {
  CHAT_ROOM_WEB_SEARCH_PROMPT,
  CHATROOM_IDENTIFIER_PROMPT,
  CHATROOM_SYNTHESIS_PROMPT,
  IDENTIFIER_PROMPT,
  IntentIdentifier,
  KNOWLEDGE_DISTRIBUTOR_PROMPT,
} from "../Prompts/Prompts.js";
import {
  CentralFunctionProcessor,
  ExeCuteContextEngines,
} from "../Synthesis/Identifier.js";
import {
  EmitEvent,
  getIo,
  UpdateTheRoomChatCache,
} from "../websocketsHandler.js/socketIoInitiater.js";
import { index } from "./fileControllers.js";
import {
  FindIntent,
  GenerateResponse,
  HandleSummarizationOfChats,
  IdentifyUserRequest,
  SynthesisResponseGenerator,
} from "./ModelController.js";
import { supabase } from "./supabaseHandler.js";
import { v4 as uuidv4 } from "uuid";
import { ProcessUserQuery } from "./UserCreditLimitController.js";
import { cp } from "fs";
import {
  FormatSessionHistory,
  HandleDeepWebResearch,
} from "./FeaturesController.js";
import {
  FilterUrlForExtraction,
  FormattForLLM,
  GetDataFromSerpApi,
  GetDataFromSerper,
  ProcessForLLM,
} from "../OnlineSearchHandler/WebCrawler.js";
import { HandlePreProcessFunctions } from "../Synthesis/helper_functions.js";
import { CheckUserPlanStatus } from "../Middlewares/AuthMiddleware.js";
import * as crypto from "node:crpto";
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
  const num = crypto.randomInt(0, 1000000);
  // Pad with leading zeros to ensure 6 digits
  return num.toString().padStart(6, "0");
}

// To handle a new chat room creation
export const CreateChatRooms = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const user_name = req.user.username;
    if (
      !user_id ||
      !user_name ||
      typeof user_id !== "string" ||
      typeof user_name !== "string"
    ) {
      return res.status(400).send({ message: "Please Login to continue" });
    }
    const { status, error, plan_type, plan_status } = await CheckUserPlanStatus(
      user_id
    );

    if (status === false || error || !plan_type) {
      return res.status(400).send({ message: "Something went wrong" });
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

    //if the user is on free tier search for user
    if (plan_type === "free") {
      const {
        data,
        error: dbError,
        count,
      } = await supabase
        .from("chat_rooms")
        .select("*", { count: "exact" })
        .eq("user_id", user_id);

      if (dbError && parseInt(dbError.code) !== 42703) {
        console.log(dbError, "dberror");
        return res
          .status(401)
          .send({ message: "Something went wrong on our server." });
      }

      // if therer is count value and the count value is greater 1 for free users this is the limit
      if (count && count >= 1) {
        return res
          .status(401)
          .send({ message: "On free tier you can only create one room" });
      }
    }

    // creating a unique room id
    const Room_id = `Workspace>>${Room_name.trim()}&identifier>>${uuidv4()}&created_by>>${user_name.trim()}`;

    // generating a six digit unique room joining code
    const Room_Joining_code = generate6DigitCode();

    if (!Room_Joining_code) {
      return res
        .status(400)
        .send({ message: "Error while assigning your room a code" });
    }
    // Inserting the data in the database
    const { data: insertData, error: RoomCreationError } = await supabase
      .from("chat_rooms")
      .insert({
        room_id: Room_id,
        room_name: Room_name,
        room_type: Room_type,
        participant_count: Number(participant_count),
        Room_Description: Description,
        Room_Joining_code: Number(Room_Joining_code),
        created_by: user_id,
      })
      .select();

    if (RoomCreationError) {
      await notifyMe(
        "Something went wrong while creating a chatRoom",
        RoomCreationError
      );

      return res
        .status(400)
        .send({ message: "Error while processing your request " });
    }

    // update the room and members table as well to insert a new member
    const { error: memberAddingError } = await supabase
      .from("Room_and_Members")
      .insert({ member_id: user_id, room_id: Room_id });

    if (memberAddingError) {
      await notifyMe(
        "Error while adding the member to the room:",
        Room_id,
        `member_id>>
        ${user_id}`
      );
      // supabase.from("chat_rooms").delete("*").eq("room_id", Room_id);
      return res
        .status(403)
        .send({ message: "Error while processing your request " });
    }

    // update the user cacche value
    const UserAccountDataKey = `user_id=${user_id}'s_dashboardData`;

    const previousCachedData = await redisClient.hGet(
      UserAccountDataKey,
      "rooms"
    );
    if (previousCachedData) {
      const parsed = JSON.parse(previousCachedData);
      parsed.push(insertData[0]);

      await redisClient.hSet(
        UserAccountDataKey,
        "rooms",
        JSON.stringify(parsed)
      );
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
      await redisClient
        .multi()
        .set(
          RoomParticipantLimitCacheKey,
          JSON.stringify(room.participant_count)
        )
        .expire(RoomParticipantLimitCacheKey, 500);
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
    const user_id = req.user.user_id;

    if (!user_id)
      return res.status(400).send({ message: "Please login to continue" });
    const room_id = req.params.room_id;
    if (!room_id) return res.status(400).send({ message: "Invalid room id" });

    const RoomChatKey = `room_id=${room_id}'s_chat-history`;
    // await redisClient.del(RoomChatKey);
    const { status, error, plan_type, plan_status } = await CheckUserPlanStatus(
      user_id
    );

    if (status === false || error || !plan_type) {
      return res.status(400).send({ message: "Something went wrong" });
    }
    //if cache exists
    const exists = await redisClient.exists(RoomChatKey);
    let limit = plan_type !== "free" ? 15 : 10;
    if (exists) {
      const ChatHistory = await redisClient.lRange(RoomChatKey, -5, -1); //always recent messages
      const parsedChats = ChatHistory.map((jsonString) => {
        try {
          // Parse each individual string element
          return JSON.parse(jsonString);
        } catch (err) {
          // Return a placeholder or handle the error as needed
          return res.status(400).send({ error: "Parse Error", data: [] });
        }
      });

      // console.log(parsedChats);
      return res.status(200).send({ chats: parsedChats });
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
      return res.status(200).send({ chats: [], message: "No messages found" });
    }

    if (dbError) {
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

    const { status, error, plan_type, plan_status } = await CheckUserPlanStatus(
      user.user_id
    );

    if (!status || error || !plan_type) {
      return res.status(400).send({ message: "Something went wrong" });
    }
    if (plan_type === "free") {
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
    const { data, error: dberror } = await supabase
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

    if ((data && data?.length === 0) || dberror) {
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
    await notifyMe("An erro while fetching more messages");
    return res.status(500).send({ message: "Internal server error" });
  }
};
// get document specific chat history

export const GetDocumentChatHistory = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { status, error, plan_type, plan_status } = await CheckUserPlanStatus(
      user_id
    );

    if (!status || error || !plan_type) {
      return res.status(400).send({ message: "Something went wrong" });
    }
    if (!user_id)
      return res.status(400).send({ message: "Please login to continue" });

    if (plan_type === "free") {
      return res.status(403).send({
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
    const { data, error: dbError } = await supabase
      .from("Conversation_History")
      .select("created_at,question,AI_response")
      .eq("document_id", document_id)
      .eq("user_id", user_id);

    if (dbError) {
      return res.status(404).send({ message: "No such room found" });
    }

    if (data.length !== 0) {
      await redisClient
        .multi()
        .set(DocumentChatCacheKey, JSON.stringify(data))
        .expire(DocumentChatCacheKey, 1500);
    }

    return res.send(data);
  } catch (error) {
    return res.status(500).send({ message: "Internal server error" });
  }
};

// get misallaneous chat history for all the asked questions by the user related to non category specific domains and subdomains

export const GetMisallaneousChatHistory = async (req, res) => {
  try {
    const user = req.user;
    const user_id = user.user_id;
    const cursor = req.query.cursor; // Expecting ISO date string or null

    const { status, error, plan_type, plan_status } = await CheckUserPlanStatus(
      user_id
    );

    if (status === false || error || !plan_type) {
      return res.status(400).send({ message: "Something went wrong" });
    }
    // Validate User
    if (!user_id) {
      return res.status(401).send({ message: "Please login to continue" });
    }

    // Only use cache for the FIRST page (no cursor).
    const key = `history:v1:${user_id}:miscellaneous`;

    if (!cursor) {
      const exists = await redisClient.exists(key);
      if (exists) {
        const limit =
          plan_type === "free" ? 5 : plan_type === "sprint pass" ? 10 : 30;
        // Fetch requested amount from cache
        const cachedChats = await redisClient.lRange(key, 0, limit - 1);

        if (cachedChats.length > 0) {
          const parsedChats = [];

          // Safe parsing loop
          for (const jsonString of cachedChats) {
            try {
              parsedChats.push(JSON.parse(jsonString));
            } catch (e) {
              parsedChats.length = 0;
              break;
            }
          }

          if (parsedChats.length > 0) {
            const nextCursor =
              parsedChats[parsedChats.length - 1]?.created_at || null;

            return res.status(200).send({
              message: "History found (Cache)",
              data: parsedChats,
              nextCursor,
            });
          }
        }
      }
    }

    const limit = 5; // Define your limit per page

    let query = supabase
      .from("Conversation_History")
      .select("created_at, question, AI_response, metadata")
      .eq("user_id", user_id)
      .is("document_id", null)
      .order("created_at", { ascending: false }) // Newest first
      .limit(limit);

    // Apply cursor (Load older messages)
    if (cursor && cursor !== "null" && cursor !== "undefined") {
      query = query.lt("created_at", cursor);
    }

    const { data, error: dbError } = await query;

    if (dbError) {
      return res.status(500).send({
        message: "Something went wrong while fetching your chat history",
      });
    }

    // Handle Empty State
    if (!data || data.length === 0) {
      return res.status(200).send({
        message: "No more chats",
        data: [],
        nextCursor: null,
      });
    }

    if (!cursor) {
      // Serialize
      const serialized = data.map((msg) => JSON.stringify(msg));

      // This prevents appending duplicates if the user refreshes the page
      const multi = redisClient.multi();
      multi.del(key);
      multi.rPush(key, serialized); // Store Newest First (Matches DB order)
      multi.expire(key, 60 * 60 * 24); // Expire in 24 hours
      await multi.exec();
    }

    // Calculate next cursor safely
    const nextCursor =
      data.length === limit ? data[data.length - 1].created_at : null;

    return res.status(200).send({
      message: "Chats found",
      data: data,
      nextCursor,
    });
  } catch (err) {
    // await notifyMe(...) // specific error handling
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

// Handles one document scope rag operations for the users in the chatroom
export const QueryDocWithAntiNodeInChatRoom = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const io = getIo();

    const { status, error, plan_type, plan_status } = await CheckUserPlanStatus(
      userId
    );

    if (status === false || error || !plan_type) {
      return res.status(400).send({ message: "Something went wrong" });
    }
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
    if (plan_type === "free") {
      if (io) {
        io.to(room_id).emit("recieved_message", {
          message_id: MessageId,
          sent_by: null,
          message: `${
            req.user.username || "User"
          } needs to have an active subscription in order to be able to use AntiNode AI in a chat room.`,
          room_id: room_id,
          users: { username: "AntiNode" },
          sent_at: currentTime || new Date().toISOString(),
        });
      }
      return res.status(200).send({
        answer:
          "You need to have an active subscription in order to be able to use AntiNode AI in a chat room.",
      });
    }
    // check for matching results from db
    const DbResults = await index.searchRecords({
      query: {
        topK:
          plan_type === "free" ? 50 : plan_type === "sprint pass" ? 100 : 500,
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
      process.env.SYSTEM_PROMPT,
      req.user,
      plan_type
    );

    if (!AnswerToQuestion || AnswerToQuestion.error) {
      return res.status(400).send({
        message:
          "Error while generating a response the server is very busy right now !",
      });
    }

    if (io) {
      io.to(room_id).emit("recieved_message", {
        message_id: MessageId,
        sent_by: null,
        message: AnswerToQuestion,
        room_id: room_id,
        users: { username: "AntiNode" },
        sent_at: currentTime || new Date().toISOString(),
      });
    }

    // sote the messagein the db
    const { error: dbError } = await supabase.from("room-chat-history").insert({
      sent_by: null,
      message: AnswerToQuestion,
      room_id: room_id,
      message_id: MessageId,
      sent_at: currentTime || new Date().toISOString(),
    });
    if (dbError) {
      await notifyMe(
        `An error occured of critical level occured when storing chat history in the db at ${currentTime}`
      );
    }
    // update the cache for AntiNode
    await UpdateTheRoomChatCache(
      room_id,
      AnswerToQuestion,
      currentTime || new Date().toISOString,
      null,
      { username: "AntiNode" }
    );
    return res.status(200).send({ answer: AnswerToQuestion });
  } catch (error) {
    notifyMe("room doc rag error in chatroom controller line 1010", error);

    return res.satus(500).send({ message: "Something went wrong" });
  }
};
//web search handler for rooms
export const QueryWebInAntiNodeChatRoom = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const io = getIo();

    if (!user_id) {
      return res.status(401).send({ message: "Please login to continue" });
    }

    const { room_id, MessageId, query, web_search_depth } = req.body;

    if (
      !room_id ||
      typeof room_id !== "string" ||
      !MessageId ||
      typeof MessageId !== "string" ||
      !query ||
      typeof query !== "string" ||
      !web_search_depth ||
      typeof web_search_depth !== "string"
    ) {
      return res.status(400).send({
        message:
          "Some parameters are missng , this is not a problem from your side, please wait while we fix this issue , we appreciate your patience!",
      });
    }

    // if user isnot premium user block their request
    const { status, error, plan_type, plan_status } = await CheckUserPlanStatus(
      req.user.user_id
    );

    if (status === false || error || !plan_type) {
      EmitEvent(room_id, "recieved_message", {
        message_id: MessageId,
        sent_by: null,
        message: `User ${req.user.username} is not a premium member that is why they cannot peform web search in a chat room`,
        room_id: room_id,
        users: { username: "AntiNode" },
        sent_at: currentTime || new Date().toISOString(),
      });
      return res.status(400).send({
        message: `User ${req.user.username} is not a premium member that is why they cannot peform web search in a chat room`,
      });
    }

    if (plan_type === "free" && web_search_depth !== "deep_web") {
      return res.status(400).send({
        message: "You need a premium plan in order to access deep web search.",
      });
    }
    let InDepthQueries = [];
    // check the quota status of the user
    const UpdateState = await ProcessUserQuery(req.user, "web_search");

    // if user has reached the
    if (UpdateState?.status === false) {
      return res.status(400).send({
        message: `User ${req.user.username} has exhausted their monthly quota to participate in the additional feature of the room, ${req.user.username} you can get our premium plan right now and continue the research with your teams right away or wait please wait till it renews.`,
      });
    }

    let WebResults;
    // if the query type is deep_web
    if (web_search_depth === "deep_web") {
      EmitEvent(room_id, "query_status", {
        MessageId,
        status: {
          message: `Understanding_Intent`,
          data: [`I am now Breaking down ${req.user.username}'s intent`],
        },
      });
      // break the query into subquries for deep_research and google dorking stuff
      const IdentifyUserIntent = await FindIntent(IntentIdentifier, query);

      if (IdentifyUserIntent?.error) {
        return res.status(400).send({
          message:
            "Looks like our models are overloaded right now please wait before trying again, thanks for your patience",
        });
      }

      // convert the queries into a series of array of strings
      const FormattedQueries = FilterIntent(IdentifyUserIntent); //create an array of quries

      if (
        !Array.isArray(FormattedQueries) ||
        FormattedQueries?.error ||
        FormattedQueries?.length === 0
      ) {
        return res.status(400).send({
          message:
            "Looks like our models are overloaded right now please wait before trying again, thanks for your patience",
        });
      }
      InDepthQueries = [...FormattedQueries];
      EmitEvent(room_id, "query_status", {
        MessageId,
        status: {
          message: `Crawling_deep_web`,
          data: [
            `Crawling deep web for following queries ,${JSON.stringify(
              FormattedQueries
            )}`,
          ],
        },
      });

      // send queries to the crawler to scrape
      const FinalLinksToScrape = await HandleDeepWebResearch(
        FormattedQueries,
        req.user,
        room_id,
        MessageId,
        plan_type
      );

      if (FinalLinksToScrape?.length === 0) {
        return res.status(400).send({
          message:
            "Looks like our models are overloaded right now please wait before trying again, thanks for your patience",
        });
      }

      // parse the results and extract organic results and convert it into an array of link(string)
      let LinksToFetch = [];
      // handle each source links extraction
      FinalLinksToScrape.forEach((li) => {
        if (li) {
          const data = FilterUrlForExtraction(li, req.user, MessageId, room_id);
          LinksToFetch.push(data);
        }
      });

      // as the results array will be nested we flat it
      const FlatLinks = LinksToFetch.flat();

      if (FlatLinks.length === 0) {
        return res
          .status(400)
          .send({ message: "An error occured while processing your request" });
      }

      // web send the links to the crawler to scrape and process
      const CleanedWebData = await ProcessForLLM(
        FlatLinks,
        req.user,
        query,
        MessageId,
        room_id
      );

      if (!CleanedWebData || CleanedWebData.length === 0) {
        return res
          .status(400)
          .send({ message: "An error occured while processing your request" });
      }

      // we put the results in the webResults array
      WebResults = FormattForLLM(CleanedWebData);
    } else {
      const response = await GetDataFromSerper(
        query,
        req.user,
        MessageId,
        room_id
      );

      if (!response) {
        return res
          .status(400)
          .send({ message: "An error occured while processing your request" });
      }

      // convert the results into array of links
      const LinksToFetch = FilterUrlForExtraction(
        response,
        req.user,
        MessageId,
        room_id
      );

      if (LinksToFetch.length === 0) {
        return res
          .status(400)
          .send({ message: "An error occured while processing your request" });
      }

      EmitEvent(room_id, "query_status", {
        MessageId,
        status: {
          message: `reading_links`,
          data: LinksToFetch,
        },
      });

      // scrape and optimize the context for the llm
      const CleanedWebData = await ProcessForLLM(
        LinksToFetch,
        req.user,
        query,
        MessageId,
        room_id
      );

      if (CleanedWebData.length === 0) {
        return res
          .status(400)
          .send({ message: "An error occured while processing your request" });
      }

      // give it to the model
      WebResults = FormattForLLM(CleanedWebData);
    }
    if (
      !WebResults ||
      WebResults?.error ||
      WebResults?.FinalContent?.length === 0
    ) {
      return res
        .status(400)
        .send({ message: "An error occured while processing your request" });
    }

    const WebResultPrompt = CHAT_ROOM_WEB_SEARCH_PROMPT;

    let AnswerToQuestion = await GenerateResponse(
      InDepthQueries.length > 0
        ? `These are subqueries obtained by understanding the user request created by you earlier use these within your response to make your research to be authentic=${JSON.stringify(
            InDepthQueries
          )}&UserQuery=${query}`
        : query,
      JSON.stringify(WebResults.FinalContent),
      WebResultPrompt,
      req.user,
      plan_type
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
        users: { username: "AntiNode" },
        sent_at: currentTime || new Date().toISOString(),
      });
    }
    // store the message in the db
    const { error: dbError } = await supabase.from("room-chat-history").insert({
      sent_by: null,
      message: AnswerToQuestion,
      room_id: room_id,
      message_id: MessageId,
      sent_at: currentTime || new Date().toISOString(),
    });
    if (dbError) {
      notifyMe(
        `An error occured of critical level occured when storing chat history in the db at ${currentTime}`
      );
    }
    // update the cache for AntiNode
    await UpdateTheRoomChatCache(
      room_id,
      AnswerToQuestion,
      currentTime || new Date().toISOString,
      null,
      { username: "AntiNode" }
    );
    const FormattedFavIcon = {
      MessageId: MessageId,
      favicon: WebResults.favicons || [],
    };
    return res.send({
      answer: AnswerToQuestion,
      favicon: FormattedFavIcon,
    });
  } catch (error) {
    notifyMe("Error in quey web in chatRoomController.js line-1343", error);
    return res.status(500).send({ message: "Something went wrong" });
  }
};

// Handle chatroom synthesis request
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
    const UpdateState = await ProcessUserQuery(req.user, "Synthesis");

    // if user has reached the
    if (UpdateState?.status === false) {
      return res.status(200).send({
        Answer: `${user.username}'s monthly quota has finished in order for them to continue using advanced feature they can either become a pro member or wait till next month for renewal.`,
        message: "Response found",
        docUsed: [],
      });
    }
    //process the request and gather context
    const ProcessQuery = await IdentifyRequestInputs(
      user,
      question,
      documents,
      room_id,
      MessageId
    );

    if (
      !ProcessQuery?.data ||
      ProcessQuery.data === null ||
      ProcessQuery?.error
    ) {
      return res.status(400).send({
        message: ProcessQuery?.message,
      });
    }
    if (io) {
      io.to(room_id).emit("recieved_message", {
        message_id: MessageId,
        sent_by: null,
        message: ProcessQuery?.SynthesizedResponse,
        room_id: room_id,
        users: { username: "AntiNode" },
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
      notifyMe(
        `An error occured of critical level occured when storing chat history in the db at ${currentTime}`
      );
    }

    // update the cache for AntiNode
    await UpdateTheRoomChatCache(
      room_id,
      ProcessQuery?.SynthesizedResponse,
      currentTime || new Date().toISOString,
      null,
      { username: "AntiNode" }
    );
    return res.send({
      Answer: ProcessQuery?.data,
    });
  } catch (synthesisError) {
    await notifyMe(
      "An error occured while creating a synthesized result in a chatroom",
      synthesisError
    );
    return res.status(500).send({
      message:
        "Our AI models seems to be overloaded right now we are sorry for the iconvenience.",
    });
  }
};

// helper function for chatroom synthesis handler
export async function IdentifyRequestInputs(
  user,
  question,
  selectedDocuments,
  room_id,
  MessageId
) {
  try {
    const { status, error, plan_status, plan_type } = await CheckUserPlanStatus(
      user?.user_id
    );

    if (status === false || error || !plan_type) {
      return { error: "An error occured", error: error, data: null };
    }
    // if they have manually selected any documents let fetch the metadata of those docs
    let metadata = [];
    if (selectedDocuments?.length > 0) {
      const results = await Promise.all(
        selectedDocuments.map(async (id) => {
          if (!id) return null;

          const { data, error } = await supabase
            .from("Contributions")
            .select("feedback,metadata")
            .eq("document_id", id)
            .eq("user_id", user.user_id)
            .single();

          if (error || !data) {
            return { message: "An error occured", error: error, data: null };
          }

          return { message: "No issue here", error: null, data: data };
        })
      );

      const metadata = [];
      for (const result of results) {
        if (!result) continue; // Skip nulls

        // Check for the error flag we returned above
        if (result.error) {
          return {
            message: "An error occured",
            error: result.error,
            data: null,
          };
        }

        metadata.push(result);
      }

      // console.log(metadata);
      if (!metadata || metadata?.length === 0) {
        return {
          message: "An error occured",
          error: "metadata not found",
          data: null,
        };
      }
    }

    if (metadata) {
      EmitEvent(user.user_id, "query_status", {
        MessageId,
        status: {
          message: "Metadata_analysis",
          data: [
            `Analyzed the metadata of the for selected-documents ${JSON.stringify(
              selectedDocuments
            )}`,
          ],
        },
      });
    }
    // prepare a basic first step context for the model
    const context = `This is the users question=${question}and these are the manually selected user documents ${JSON.stringify(
      selectedDocuments
    )}and this is the information of selected documents=${
      metadata ? metadata : "['No metadata found in the database']"
    } `; //command for the model

    // request for inten identification
    const responseText = await IdentifyUserRequest(context, IDENTIFIER_PROMPT);
    if (!responseText) {
      return {
        message: "An error occured",
        error: "No model response",
        data: null,
      };
    }

    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: "Understanding Request",
        data: ["Calling tools"],
      },
    });

    // extract the function as well as the confidence score of the model
    const ExtractedFunctions = CentralFunctionProcessor(
      responseText,
      user,
      MessageId
    ); //clearing the function string

    //if there is no confidence score or the functions or error
    if (
      !ExtractedFunctions?.confidence ||
      ExtractedFunctions.PreProcessFunctions.length === 0 ||
      ExtractedFunctions.error
    ) {
      return {
        message: "An error occured",
        error: `Extracted functions are empty that should have been generated by the llm=${ExtractedFunctions?.error}`,
        data: null,
      };
    }

    //if there is a message
    if (ExtractedFunctions?.error) {
      return {
        message: "An error occured",
        error: ExtractedFunctions?.error,
        data: null,
      };
    }

    // list the functions that are needed to pre process the requests
    let PreProcessedData;
    //if the confidence is low call the functions that are required
    if (ExtractedFunctions.confidence === "low") {
      PreProcessedData = await HandlePreProcessFunctions(
        ExtractedFunctions.PreProcessFunctions,
        user,
        selectedDocuments
      );

      if (!PreProcessedData || PreProcessedData?.error) {
        return {
          message: "An error occured",
          error: PreProcessedData?.error,
          data: null,
        };
      }

      // if both the fields are empty
      if (
        PreProcessedData.AlldocumentInformation?.length === 0 &&
        PreProcessedData.context_by_uuid.length === 0
      ) {
        return {
          message: "An error occured",
          error: `PreProcessedData functions are are not available=${JSON.stringify(
            PreProcessedData
          )}`,
          data: null,
        };
      }
    }

    //if there is preprocesed data re run the loop
    const SecondTimeresponseText = await IdentifyUserRequest(
      context,
      IDENTIFIER_PROMPT
    );
    if (!SecondTimeresponseText) {
      notifyMe(
        `Error while generating a response , the code execution results are these`
        // JSON.stringify(result.codeExecutionResult)
      );
      return {
        message: "An error occured",
        error: `The LLM failed to generate another pass reasoning step`,
        data: null,
      };
    }

    //rpcess the functions if the request was low confident for the first time
    const ExtractFUnctionsAgain = CentralFunctionProcessor(
      SecondTimeresponseText,
      user,
      MessageId
    ); //clearing the function string

    //if there is no confidence score or the functions or error
    if (
      !ExtractFUnctionsAgain?.confidence ||
      ExtractFUnctionsAgain.PreProcessFunctions.length === 0 ||
      ExtractFUnctionsAgain.error
    ) {
      return {
        message: "An error occured",
        error: `There are no extracted functions in the second reasoning run`,
        data: null,
      };
    }
    // console.log(ExtractedFunctions);
    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: "Creating functions",
        data: [JSON.stringify(ExtractedFunctions)],
      },
    });

    // gather the context from all the required sources
    const smartExecResult = await ExeCuteContextEngines(
      ExtractFUnctionsAgain,
      user,
      selectedDocuments,
      MessageId
    );

    if (!smartExecResult.GlobalContextObject || smartExecResult.error) {
      notifyMe(
        "An error occured in the chatrooom synthesis controller line 1539 ",
        smartExecResult?.error
      );
      return {
        message: "An error occured",
        error: `The GLobal context object is not present`,
        data: null,
      };
    }

    const PastChats = await ExtractChatHistory(room_id, user, plan_type);
    if (PastChats.length > 0) {
      smartExecResult.GlobalContextObject.pastConversation = [...PastChats];
    }

    // generate a response for the room
    const ModelResponse = await SynthesisResponseGenerator(
      JSON.stringify(smartExecResult),
      question,
      user,
      CHATROOM_SYNTHESIS_PROMPT,
      plan_type
    );

    if (ModelResponse.error) {
      return {
        message: "An error occured",
        error: `The LLM failed to generate final response synthesis step`,
        data: null,
      };
    }

    //incremetn query counter

    return {
      data: ModelResponse,
      message: "No issue here",
      error: null,
    };
  } catch (SynthesisError) {
    console.error(SynthesisError);
    await notifyMe("An error occured in the synthesis hanlder", SynthesisError);
  }
}

//helper function to inject room chat history in in the model context object
async function ExtractChatHistory(room_id, user, plan_type) {
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
    //if the length has reached a number of 10 for paid members only with higher payment tier
    if (plan_type !== "free" || plan_type !== "sprint pass") {
    }
    if (batchsize || timeGap > STALE_THRESHOLD_MS) {
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
