import { getJson } from "serpapi";
import dotenv from "dotenv";
import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
dotenv.config();

// currrently being used for free users
export const GetDataFromSerpApi = async (query, user, room_id, MessageId) => {
  try {
    if (room_id) {
      EmitEvent(room_id, "query_status", {
        MessageId,
        status: {
          message: "fetching_url",
          data: [`Searching for ${query}`],
        },
      });
    } else {
      // else send it the solo user
      EmitEvent(user.user_id, "query_status", {
        MessageId,
        status: {
          message: "fetching_url",
          data: [`Searching for ${query}`],
        },
      });
    }
    const SERPAPI_KEY = process.env.SERP_API;
    const response = await getJson({
      engine: "google_light",
      api_key: SERPAPI_KEY,
      q: query,
      google_domain: "google.com",
      hl: "en",
      num: 3,
    });

    console.log(response);
    return response;
  } catch (error) {
    notifyMe("An error has been sent by serperAPI", error);
    return { error: error }; // Return empty array so your scraper doesn't crash
  }
};

export const FormalSerpAPIresults = (response) => {
  try {
    const url = [];
    const organicResults = response?.organic_results;
    if (organicResults && organicResults?.length > 0) {
      organicResults.forEach((res) => {
        if (res && res?.link) {
          url.push(res.link);
        }
      });
    }
    return url;
  } catch (error) {
    return { error: error };
  }
};
