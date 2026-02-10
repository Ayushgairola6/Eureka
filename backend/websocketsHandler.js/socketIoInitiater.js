import { supabase } from "../controllers/supabaseHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import cookie from "cookie";
import { GenerateAccessTokens } from "../controllers/AuthController.js";
import { verifyJwtAsync } from "../Middlewares/AuthMiddleware.js";
import { Server } from "socket.io";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import { redisClient } from "../CachingHandler/redisClient.js";
import { domainToASCII } from "url";

const Room_And_their_members = new Map();
// Authenticating the user
let io;
export const initializeSocketIo = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "https://AntiNode-six-eta.vercel.app"], // Your frontend URL
      credentials: true,
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
      ],
      methods: ["GET", "POST", "OPTIONS"],
    },
  });

  // verify the user to give access to the server
  io.use(async (socket, next) => {
    try {
      // 1. Extract Token (Cookies or Auth Object)
      const cookies = socket.handshake.headers.cookie
        ? cookie.parse(socket.handshake.headers.cookie)
        : {};

      const AuthTokenFromCookies =
        cookies["AntiNode_eta_six_version1_AuthToken"];
      const AuthTokenFromHandshake = socket.handshake.auth.token;
      const AccessToken = AuthTokenFromCookies || AuthTokenFromHandshake;

      if (!AccessToken) {
        return next(new Error("Authentication error: Token not provided"));
      }

      try {
        // 2. Try to verify access token directly
        const decoded = await verifyJwtAsync(
          AccessToken,
          process.env.JWT_SECRET
        );

        // Attach user data to socket instance (Matching req.user)
        socket.user = decoded;
        socket.user_id = decoded.user_id;
        return next();
      } catch (err) {
        // 3. Handle Token Expiry (Refresh Flow)
        if (err.name === "TokenExpiredError") {
          // Decode without verifying to get user details for the Cache Key
          const DecodedData = jwt.decode(AccessToken);
          if (!DecodedData || !DecodedData.user_id) {
            return next(new Error("Authentication error: Malformed token"));
          }

          const RefreshTokenKey = `user=${DecodedData.username}'s_userId=${DecodedData.user_id}`;

          // 4. Check Redis Cache first (Matching API Logic)
          const HasCacheRefreshToken = await redisClient.get(RefreshTokenKey);
          let refreshToken;

          if (HasCacheRefreshToken) {
            refreshToken = JSON.parse(HasCacheRefreshToken);
          } else {
            // 5. Fallback to Supabase
            const { data, error } = await supabase
              .from("Tokens")
              .select("Refresh_Token")
              .eq("user_id", DecodedData.user_id);

            if (error || !data || data.length === 0) {
              return next(new Error("Session expired. Please log in again."));
            }

            refreshToken = data[0].Refresh_Token;

            // 6. Update Redis Cache (Matching API Logic)
            await redisClient
              .multi()
              .set(RefreshTokenKey, JSON.stringify(refreshToken))
              .expire(RefreshTokenKey, 1800);
          }

          // 7. Verify the Refresh Token
          let refreshDecoded;
          try {
            refreshDecoded = await verifyJwtAsync(
              refreshToken,
              process.env.REFRESH_TOKEN_SECRET
            );
          } catch (refreshErr) {
            // If refresh token is invalid, clear cache and error out
            const hasCachedRefreshToken = await redisClient.get(
              RefreshTokenKey
            );
            if (hasCachedRefreshToken) {
              await redisClient.del(RefreshTokenKey);
            }
            return next(new Error("Session expired. Please log in again."));
          }

          // 8. Generate New Access Token
          const newAccessToken = GenerateAccessTokens(
            refreshDecoded.user_id,
            refreshDecoded.email,
            refreshDecoded.username,
            refreshDecoded.AllowedTrainingModels
          );

          // 9. Update Access Token in DB
          await supabase
            .from("Tokens")
            .update({ Access_Token: newAccessToken })
            .eq("Refresh_Token", refreshToken);

          // Update the current socket context so this connection is valid
          socket.user = refreshDecoded;
          socket.user_id = refreshDecoded.user_id;

          // if (socket.handshake.headers.cookie) {
          //   socket.handshake.headers.cookie =
          //     socket.handshake.headers.cookie.replace(
          //       AccessToken,
          //       newAccessToken
          //     );
          // }

          return next();
        }

        // Handle invalid tokens that aren't just expired
        return next(new Error("Authentication error: Invalid token"));
      }
    } catch (error) {
      console.error("Socket Auth Error:", error);
      return next(new Error("Internal server error"));
    }
  });
  // connecting with the websocket connection
  io.on("connection", (socket) => {
    // joining a specific chatRoom
    console.log("new user connected to the socket");

    if (socket.user_id) {
      socket.join(socket.user_id);
    }

    //event to join the user in a room
    socket.on("Joining_a_chat_room", (room_information) => {
      const { username, room_id, room_name, user_id } = room_information;
      // console.log("Joining chat room");
      console.log(username, "is the joining chat room:", room_id);

      if (!room_id || !room_name || !username || !user_id) {
        socket.emit("Room_notification", {
          message: "An error occured while trying to joining the room",
        });
        return;
      }

      socket.join(room_id);

      // io.to(room_id).emit("room-info", username);
      // io.to(user_id).emit("room-info", membername);
      io.to(room_id).emit("Room_notification", {
        message: `${username} Joined the room`,
      });
    });

    // leaving a chatRoom
    socket.on("leaving_chat_room", (data) => {
      const { room_id, username } = data;
      console.log(username, "is the Leaving chat room:", room_id);

      if (!room_id || !username) {
        socket.emit("Room_notification", {
          message: "Unable to leave the room",
        });
        return;
      }

      socket.leave(room_id);

      // Broadcast to everyone EXCEPT the socket that is leaving
      // io.to(room_id).emit("room-info", membername);
      io.to(room_id).emit("Room_notification", {
        message: `${username} left the room`,
      });
      return;
    });

    //liking a response
    socket.on("liked_response", async (data, vote_type, user_id, id) => {
      if (!data) {
        return;
      }
      //if the message is old or new

      // store the data in the db
      if (data.length === 0) {
        const { error } = await supabase.from("liked_documents").insert({
          message_id: id,
          user_id: user_id,
          vote_type: vote_type,
        });

        if (error) {
          console.error(error);
          return;
        }
      } else {
        const finalArray = [];
        data.forEach((el) => {
          finalArray.push({
            document_id: el,
            user_id: user_id,
            vote_type: vote_type,
            message_id: id,
          });
        });

        const { data: finalized, error } = await supabase
          .from("liked_documents")
          .upsert(finalArray);

        if (error) {
          return;
        }
      }

      io.to(user_id).emit("feedback_recorded", {
        id: id,
        status: "Feedback recorded",
      });
    });

    // sending new message
    socket.on("new_message", async (data) => {
      const { message_id, sent_by, message, room_id, users, sent_at } = data;

      if (
        !message ||
        !room_id ||
        typeof message !== "string" ||
        !users ||
        typeof users !== "object" ||
        !message_id
      ) {
        socket.emit("Room_notification", {
          message: "Some fields are missing",
        });
        return;
      }

      try {
        const storeResult = await StoreMessage(
          sent_by,
          message,
          room_id,
          message_id,
          sent_at
        );

        if (storeResult?.error) {
          socket.emit("Room_notification", {
            message: "Something went wrong, please try again later!",
          });
          return;
        }

        await UpdateTheRoomChatCache(
          room_id,
          message,
          sent_at || new Date().toISOString(),
          sent_by,
          users
        );

        io.to(room_id).emit("recieved_message", {
          message_id,
          sent_by,
          message,
          room_id,
          users,
          sent_at: sent_at || new Date().toISOString(),
        });
        return;
      } catch (error) {
        socket.emit("Room_notification", { message: "Internal server error" });
      }
    });

    //emitting notification

    socket.on("send_notification", async (data) => {
      const { user_id, room_code } = data;
      // console.log(data)
      if (!user_id || !room_code) {
        socket.emit("Room_notification", { message: "Some error occurred !" });
        return;
      }
      const room_id = await CheckRoomIdAssociatedWithRoomCode(room_code);
      if (room_id.error || !room_id) {
        socket.emit("Room_notification", { message: "Some error occurred !" });
        return { error: "Unable to store the message" };
      }

      const notification_type = "Room-joining-request";

      const { data: notifications, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", room_id.created_by);

      if (error) {
        socket.emit("Room_notification", { message: "Some error occurred !" });
        return { error: "Unable to store the message" };
      }
      io.to(room_id.created_by).emit("new_Notification", notifications);
      return;
    });

    // when a new file is selected for the room
    socket.on("NewFileSelected", (data) => {
      const { file, room_id, username } = data;
      if (!file || !room_id || !username) {
        socket.emit("Room_notification", {
          message: "Either username or room_id not found",
        });
        return;
      }
      io.to(room_id).emit("NewFileForRoom", file);
    });
    // send the some is typing event
    socket.on("isTyping", (data) => {
      const { room_id, username } = data;
      if (!username || !room_id) {
        socket.emit("Room_notification", {
          message: "Either username or room_id not found",
        });
        return { error: "Either username or room_id not found" };
      }
      // console.log(`${username} is typing`);
      io.to(room_id).emit("someone-typing", `${username} is typing `);
    });

    // disconnect the server
    socket.on("disconnect", () => {});
  });
};

export const getIo = () => {
  if (!io) {
    throw new Error(
      "Socket.IO not initialized. Call initializeSocketIo first."
    );
  }
  return io;
};

// find who is the admin of that room

//Update the message in  the message in Cache
export const UpdateTheRoomChatCache = async (
  room_id,
  message,
  sent_at,
  sent_by,
  users
) => {
  const roomChatCacheKey = `room_id=${room_id}'s_chat-history`;
  const MessageObject = {
    message: message,
    sent_at: sent_at,
    sent_by: sent_by,
    room_id: room_id,
    users: users,
  };
  const stringifiedMessage = JSON.stringify(MessageObject);
  const MAX_HISTORY = 20;

  try {
    const multi = redisClient.multi();

    multi
      .rPush(roomChatCacheKey, stringifiedMessage)
      .lTrim(roomChatCacheKey, -MAX_HISTORY, -1); //remove and older message after reaching a certain limit

    multi.expire(roomChatCacheKey, 4000); // 4000*60*60 1.1 hours or 4000 seconds

    // 4. Execute the atomic operation in a single network round-trip.
    await multi.exec();
  } catch (ChatCacheError) {
    await notifyMe(ChatCacheError);
  }
};

//function to store message in the database

const StoreMessage = async (sent_by, message, room_id, message_id, sent_at) => {
  try {
    if (!sent_by || !message || !room_id || !sent_at) {
      return { error: "All parameters are required" };
    }
    // the one who sent the message
    let final_sent_by = sent_by;

    if (sent_by === "AntiNode" || sent_by === "SYSTEM") {
      final_sent_by = null;
    }

    const { error } = await supabase.from("room-chat-history").upsert({
      sent_by: final_sent_by,
      message: message,
      room_id: room_id,
      message_id: message_id,
      sent_at: sent_at,
    });
    if (error) {
      return { error: "Unable to store the message" };
    }
    return { message: "Stored" };
  } catch (error) {
    return { error: error };
  }
};

//check for any updates from the notification table

async function CheckRoomIdAssociatedWithRoomCode(room_code) {
  try {
    const { data, error } = await supabase
      .from("chat_rooms")
      .select("room_id,created_by")
      .eq("Room_Joining_code", room_code)
      .single();

    if (error) {
      console.log(error);
      return { error: "No new notifications" };
    }

    return data;
  } catch (error) {
    console.error(error);
    return { error };
  }
}

// controller to send events
export function EmitEvent(reciever, eventName, eventValue) {
  if (io) {
    io.to(reciever).emit(eventName, eventValue);
  }
}
