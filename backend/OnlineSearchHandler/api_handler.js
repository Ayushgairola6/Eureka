import { ApifyClient } from "apify-client";
import dotenv from "dotenv";
dotenv.config();

const AUTH_TOKEN = process.env.API_TOKEN;
const client = new ApifyClient({
  token: AUTH_TOKEN,
});

// Starts an actor and waits for it to finish.
const { defaultDatasetId } = await client.actor("web-search-support").call();
// Fetches results from the actor's dataset.
const { items } = await client.dataset(defaultDatasetId).listItems();
