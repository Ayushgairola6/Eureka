import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";

export const SendNotification = async (io, metadata, to) => {
  try {
    const notification = io.to(to).emit("new_Notification");
  } catch (notificationerror) {
    await notifyMe(notificationerror);
  }
};
