import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config();

const token = process.env.TELEGRAMTOKEN;
const bot = new TelegramBot(token, { polling: false });

const MY_CHAT_ID = process.env.MY_CHAT_ID;

async function notifyMe(message, error) {
  try {
    await bot.sendMessage(MY_CHAT_ID, `🔔 ${`${message} ${error}`} `);
  } catch (error) {}
}

export { notifyMe };
