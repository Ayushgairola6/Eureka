import tavily from "@tavily/core";
import dotenv from "dotenv";
dotenv.config();

const tvly = tavily({ apiKey: process.env.TAVILY_WEB_SEARCH_API_KEY });

const SearchQueryResults = async (query) => {
  try {
    if (!query || typeof query !== "string") {
      return { error: "Invalid query type" };
    }

    const response = await tvly.search(query);
    if (!response || response.detail.error) {
      return { error: "Unable to find results online" };
    }
    return response;
  } catch (error) {
    return { error };
  }
};

const FormatSearchResults = (searchresult) => {};
