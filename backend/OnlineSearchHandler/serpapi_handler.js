import { getJson } from "serpapi";
import dotenv from "dotenv";
import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
dotenv.config();

// currrently being used for free users
export const GetDataFromSerpApi = async (
  query,
) => {
  try {

    console.log("Request reached the serpaapi function")
    const SERPAPI_KEY = process.env.SERP_API;
    const response = await getJson({
      engine: "google",
      api_key: SERPAPI_KEY,
      q: query,
      google_domain: "google.com",
      hl: "en",
      num: 7,
    });

    return { err: null, response: response };
  } catch (error) {
    console.error(error, 'serp api error')
    notifyMe("An error has been sent by serperAPI", error);
    return { err: error, response: null }; // Return empty array so your scraper doesn't crash
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
