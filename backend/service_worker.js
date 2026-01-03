import cron from "node-cron";
import { notifyMe } from "./ErrorNotificationHandler/telegramHandler.js";

cron.schedule("*/14 * * * * ", async () => {
  // await notifyMe("The server has been pinged to keep it awake");
});
