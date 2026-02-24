import { redisClient } from "../CachingHandler/redisClient.js";
import {
  CheckPresenceAndArrayValidity,
  CheckPresenceAndStringValidity,
} from "../ErroHandler/ErrorHandler.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import { CheckUserPlanStatus } from "../Middlewares/AuthMiddleware.js";
import { GetDataFromSerper } from "../OnlineSearchHandler/WebCrawler.js";
import { supabase } from "./supabaseHandler.js";

//extracts and caches the users session chathistory
export const HandleUserSessionHistory = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(400).send({ message: "Please login to continue" });

    const { lastMessageTime } = req.body;
    if (CheckPresenceAndStringValidity(lastMessageTime) === false) {
      return res.status(400).send({ message: "Invalid data type " });
    }
    const key = `user_id=${user.user_id}_time=${new Date().toDateString()}`;

    // await redisClient.del(key);
    const exists = await redisClient.exists(key);
    if (exists) {
      // last 10 messages
      const chats = await redisClient.lRange(key, 0, 5); //current support only 5 last messages
      const parsedChats = chats.map((data) => {
        return JSON.parse(data);
      });
      return res
        .status(200)
        .send({ message: "Cache found", history: parsedChats });
    }

    // get data from db
    let query;
    // if theer isnot lastmessagetime or there is but it is 0 fetch only 5
    if (!lastMessageTime || lastMessageTime === "0") {
      query = supabase
        .from("Conversation_History")
        .select("created_at,id,user_id,question,AI_response")
        .eq("user_id", user.user_id)
        .limit(5)
        .order("created_at", { ascending: false });
    } else if (lastMessageTime !== "0") {
      // if theer is an actual last messageId get older messages
      query = supabase
        .from("Conversation_History")
        .select("created_at,id,user_id,question,AI_response")
        .eq("user_id", user.user_id)
        .limit(5)
        .order("created_at", { ascending: false })
        .lt("created_at", lastMessageTime);
    }

    if (!query) {
      notifyMe(
        "The query construction failed in handleUsersessionhistory in featurecontroller line 56"
      );
      return res.status(403).send({
        message:
          "There was an error in our database we are trying to fix it and apologize for the inconvenience.",
      });
    }
    const { data, error } = await query;
    if (error) {
      return res
        .status(400)
        .send({ message: "An error occured while fetching session history" });
    }
    // await StoreUserSessionHistory(data);

    const chronological = data.reverse();
    const FormattedResults = FormatSessionHistory(chronological);

    if (FormattedResults.length === 0) {
      return res.status(400).send({ message: "Something went wrong" });
    }

    const serialized = chronological.map((msg) => JSON.stringify(msg));
    await redisClient.multi().rPush(key, serialized).expire(key, 5000); //expire after a while
    return res
      .status(200)
      .send({ message: "Fetched from database", history: FormattedResults });
  } catch (error) {
    await notifyMe(
      "An error occured while getting users session history",
      error
    );
    return res.status(500).send({ message: "Something went wrong" });
  }
};

//helper function to format the session history
export function FormatSessionHistory(ChatsArray) {
  if (CheckPresenceAndArrayValidity(ChatsArray) === false) {
    return { error: "The array is empty!" };
  }
  // the one qna flow object
  // const objectFormat = {
  //   created_at: "2025-11-22T16:37:46.254668+00:00",
  //   id: 144,
  //   user_id: "38f4a59b-ab88-48f6-a928-2c9e987c49e3",
  //   question:
  //     "what kind of language is python and how is different than other languages",
  //   AI_response:
  //     "Understood. I will act as a knowledge distributor, analyzing the provided context and delivering accurate information based on it. I will adhere to the specified response format rules: using visual aids when appropriate, avoiding excessive emoji use, and maintaining a professional tone. I am ready to receive the context and begin.\n",
  // };
  // the client side message object format
  // id: string;
  // sent_by: string;
  // message: messageInt;
  // sent_at: string;
  const NewArray = [];
  ChatsArray.forEach((obj) => {
    // format created_at into "day month year"
    const createdDate = new Date(obj.created_at);
    const formattedDate =
      !isNaN(createdDate) &&
      createdDate.toLocaleDateString &&
      createdDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    // user message object
    const UserObject = {
      id: `${obj.id}-user`,
      sent_by: "You",
      message: { isComplete: false, content: obj.question },
      sent_at: formattedDate || obj.created_at,
    };
    const ModelObject = {
      id: `${obj.id}-AntiNode`,
      sent_by: "AntiNode",
      message: { isComplete: false, content: obj.AI_response },
      sent_at: formattedDate || obj.created_at,
    };
    NewArray.push(UserObject); //first add the user message
    NewArray.push(ModelObject); //then add the response
  });

  return NewArray;
}

//handle the multi quries deep-web-research
export async function HandleDeepWebResearch(
  Queries,
  user,
  room_id,
  MessageId,
  plan_type
) {
  let results = [];

  for (const query of Queries) {
    const sanitizedQuery = query.trim();
    if (!sanitizedQuery) continue;

    const data = await GetDataFromSerper(
      sanitizedQuery,
      user,
      MessageId,
      room_id,
      plan_type
    );
    if (data) {
      results.push(data);
    }

    await new Promise((res) => setTimeout(res, 700));
  }

  return results.flat(); //
}

// fetch chat history from cache
export const FetchChatHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send({ message: "Please login to continue" });
    }
    const user = req.user;
    const ConversationCacheKey = `user_id=${
      user.user_id
    }_time=${new Date().toDateString()}`;
    const { status, error, plan_type, plan_status } = await CheckUserPlanStatus(
      user.user_id
    );
    if (status === false || error || !plan_type) {
      return res.status(400).send({
        error: "An error occured while processing your request",
      });
    }

    const exists = await redisClient.exists(ConversationCacheKey);
    if (exists) {
      const limit =
        plan_type === "free" ? 5 : plan_type === "sprint pass" ? 10 : 30;

      const Chats = await redisClient.lRange(ConversationCacheKey, 0, limit);
      const FinalChatArray = [];
      Chats.forEach((jsonString) => {
        try {
          if (jsonString) {
            FinalChatArray.push(JSON.parse(jsonString));
          }
        } catch (error) {
          console.error("Error in parsing the results");
        }
      });

      if (FinalChatArray.length) {
        return res.status(404).json({
          message: "An error occured while checking the cache for you history",
        });
      }

      return res
        .status(200)
        .send({ message: "History found", data: FinalChatArray });
    }

    return res.status(200).send({ message: "History not found", data: [] });
  } catch (error) {
    // console.error(error);
    await notifyMe(
      "An error occured while retriveing chat history from cache",
      error
    );
    return res.status(500).send({ message: "Something went wrong!" });
  }
};
