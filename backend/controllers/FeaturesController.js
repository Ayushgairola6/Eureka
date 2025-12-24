import { redisClient } from "../CachingHandler/redisClient.js";
import {
  CheckPresenceAndArrayValidity,
  CheckPresenceAndStringValidity,
} from "../ErroHandler/ErrorHandler.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
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

    const exists = await redisClient.exists(key);
    if (exists) {
      // last 10 messages
      const chats = await redisClient.lRange(key, 0, 10);
      const parsedChats = chats.map((data) => {
        return JSON.parse(data);
      });
      return res
        .status(200)
        .send({ message: "Cache found", history: parsedChats });
    }

    // get data from db
    let query = supabase
      .from("Conversation_History")
      .select("created_at,id,user_id,question,AI_response")
      .eq("user_id", user.user_id)
      .limit(5)
      .order("created_at", { ascending: false });

    if (lastMessageTime !== "0") {
      query += query.lt("created_at", lastMessageTime);
    }

    const { data, error } = await query;
    if (error) {
      console.error(error);
      return res
        .status(400)
        .send({ message: "An error occured while fetching session history" });
    }
    // await StoreUserSessionHistory(data);

    const FormattedResults = FormatSessionHistory(data);

    if (FormattedResults.length === 0) {
      return res.status(400).send({ message: "Something went wrong" });
    }

    const chronological = FormattedResults.reverse();

    // // 3. Serialize for Redis
    const serialized = chronological.map((msg) => JSON.stringify(msg));
    await redisClient.rPush(key, serialized);
    return res
      .status(200)
      .send({ message: "Fetched from database", history: chronological });
  } catch (error) {
    await notifyMe(
      "An error occured while getting users session history",
      error
    );
    return res.status(500).send({ message: "Something went wrong" });
  }
};

// helper function to cache user session history

function StoreUserSessionHistory(dataArray) {
  if (CheckPresenceAndArrayValidity(dataArray) === false) {
    return { error: "The array is empty!" };
  }
}

function FormatSessionHistory(ChatsArray) {
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
      id: obj.id,
      sent_by: "You",
      message: { isComplete: true, content: obj.question },
      sent_at: formattedDate || obj.created_at,
    };
    const ModelObject = {
      id: obj.id + 1,
      sent_by: "Eureka",
      message: { isComplete: true, content: obj.AI_response },
      sent_at: formattedDate || obj.created_at,
    };
    NewArray.push(UserObject); //first add the user message
    NewArray.push(ModelObject); //then add the response
  });

  return NewArray;
}
