import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "./supabaseHandler.js";
import { checkRoomMemberLimit, JoinTheUser } from "./ChatRoomController.js";
import dotenv from "dotenv";
dotenv.config();
import { getIo } from "../websocketsHandler.js/socketIoInitiater.js";
// nodemailer transporter
import { EmailServices } from "../EmailHandlers/EmailTemplates.js";
import { redisClient } from "../CachingHandler/redisClient.js";

export const GenerateRefreshTokens = (id, email, username) => {
  try {
    if (
      !id ||
      typeof id !== "string" ||
      !email ||
      typeof email !== "string" ||
      !username ||
      typeof username !== "string"
    ) {
      return { status: 400, error: "Error - Some arguments are missing !" };
    }
    const RefreshToken = jwt.sign(
      { user_id: id, email: email, username: username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
    );

    return RefreshToken;
  } catch (err) {
    console.error(err);
  }
};

const GenerateEmailVerificationTokens = (username, email) => {
  try {
    const Secret = process.env.JWT_SECRET;
    const VerificationToken = jwt.sign(
      { email: email, username: username },
      Secret,
      { expiresIn: "20min" }
    );

    return VerificationToken;
  } catch (error) {
    return error;
  }
};
export const GenerateAccessTokens = (id, email, username) => {
  try {
    if (
      !id ||
      typeof id !== "string" ||
      !email ||
      typeof email !== "string" ||
      !username ||
      typeof username !== "string"
    ) {
      return { status: 400, error: "Error - Some arguments are missing !" };
    }
    const Secret = process.env.JWT_SECRET;
    const AccessToken = jwt.sign(
      { user_id: id, email: email, username: username },
      Secret,
      { expiresIn: "20min" }
    );
    return AccessToken;
  } catch (err) {
    console.error(err);
  }
};
// socket instance
export const HandleUserRegistration = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (
      !username ||
      !email ||
      !password ||
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid information , please fill in correct data !",
      });
    }

    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("email", email);

    if (error) {
      return res
        .status(400)
        .json({ message: "Error setting up you account ." });
    }

    if (data.length > 0) {
      return res
        .status(400)
        .json({ message: "User already Exists  ! Please Login instead" });
    }

    const HashedPassword = await bcrypt.hash(password, 8);

    if (!HashedPassword) {
      return res
        .status(400)
        .json({ message: "Error setting up you account ." });
    }

    const NewUserAccount = await supabase.from("users").insert({
      username: username.trim(),
      email: email,
      password: HashedPassword,
    });

    if (NewUserAccount.error) {
      return res
        .status(400)
        .json({ message: "Error setting up you account ." });
    }

    const user = { username: username, email: email };
    // send welcome email with verify account email
    // const welcomeEmail = await EmailServices.sendWelcomeEmail(user).catch(error => console.error('Register email failed ;', error));
    const verificationtoken = GenerateEmailVerificationTokens(username, email);

    const verificationEmail = await EmailServices.sendAccountVerficicationEmail(
      user,
      verificationtoken
    );

    return res.json({
      message: "An email has been sent to your registered email !",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error while creating an account !" });
  }
};

export const HandleUserLogin = async (req, res) => {
  try {
    // console.log(req.body)
    const { email, password } = req.body;

    if (
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      console.error("Invalid data ");
      return res.status(400).json({ message: "Invalid data type !" });
    }

    const { data, error } = await supabase
      .from("users")
      .select("email, id, username , password")
      .eq("email", email)
      .single();

    if (!data || error) {
      console.error(error, "user not found");
      return res.status(404).json({ message: "User not found !" });
    }
    const isMatching = await bcrypt.compare(password, data.password);

    if (!isMatching) {
      console.log("passwod did not match");
      return res.status(400).send({ message: "Invalid password" });
    }

    const RefreshToken = GenerateRefreshTokens(
      data.id,
      data.email,
      data.username
    );
    if (!RefreshToken) {
      console.error("Error while geenrating refreshtoken");
      return res.status(400).send({ message: "An error occurred" });
    }
    const AuthToken = GenerateAccessTokens(data.id, data.email, data.username);

    if (!AuthToken) {
      console.error("Error while geenrating AccessToken");
      return res.status(400).send({ message: "An error occurred" });
    }
    const store = await StoreTokens(RefreshToken, AuthToken, data.id);
    if (store.error) {
      console.log(store.error);
      return res
        .status(400)
        .json({ message: "Error while logging in please try again later !" });
    }

    res.cookie("Eureka_eta_six_version1_AuthToken", AuthToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });
    // sending login notification email
    const clientIp =
      req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress;

    const LoginEmail = await EmailServices.sendLoginNotification(data, {
      ip: clientIp,
      userAgent: req.headers["user-agent"],
      browser: req.headers["sec-ch-ua"],
      platform: req.headers["sec-ch-ua"],
      timestamp: new Date(),
    });

    return res
      .status(200)
      .json({ message: "Login successfull", AuthToken: AuthToken });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error while Logging into your account !" });
  }
};

// verify the users email address and log him in into his account for first time automatically
export const VerifyEmail = async (req, res) => {
  try {
    const token = req.params.verificationtoken;

    if (!token) {
      console.log("while verifying token not found");
      return res.status(400).send({ message: "Verification token not found" });
    }
    const Secret = process.env.JWT_SECRET;

    let decoded;
    try {
      decoded = jwt.verify(token, Secret);
    } catch (jwterror) {
      console.log(jwterror);
      return res.status(400).send({ message: jwterror });
    }
    const email = decoded.email;
    const { error } = await supabase
      .from("users")
      .update({ isVerified: true })
      .eq("email", email);

    if (error) {
      conosle.log("account verification error");
      return res
        .status(400)
        .send({ message: "Error while verifying your account" });
    }

    const { data, error: userdateerror } = await supabase
      .from("users")
      .select("username,isVerified,email,id")
      .eq("email", email)
      .single();

    if (!data) {
      console.log("user not found");
      return res.status(404).send({ message: "User not found" });
    }
    // logg the user in for the first time automatically;
    const AuthToken = GenerateAccessTokens(data.id, data.email, data.username);

    if (!AuthToken) {
      console.error("Error while geenrating AccessToken");
      return res.status(400).send({ message: "An error occurred" });
    }
    const RefreshToken = GenerateRefreshTokens(
      data.id,
      data.email,
      data.username
    );
    if (!RefreshToken) {
      console.error("Error while geenrating refreshtoken");
      return res.status(400).send({ message: "An error occurred" });
    }
    const store = await StoreTokens(RefreshToken, AuthToken, data.id);
    if (store.error) {
      console.log(store.error);
      return res
        .status(400)
        .json({ message: "Error while logging in please try again later !" });
    }

    res.cookie("Eureka_eta_six_version1_AuthToken", AuthToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .send({ message: "Account verified", AuthToken: AuthToken });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong " });
  }
};
// generate access token

export const ResetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).send({ message: "Invalid email address" });
    }
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!data || error) {
      return res.status(404).send({ message: "Email address not found !" });
    }
    const user = data;
    const ResetPasswordRequestToken = jwt.sign(
      {
        user_id: data.id,
        username: data.username,
        email: data.email,
        purpose: "Password_reset",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    if (!ResetPasswordRequestToken) {
      return res
        .status(400)
        .send({ message: "An error occured, please try again !" });
    }
    const sendEmail = EmailServices.sendPasswordResetEmail(
      data,
      ResetPasswordRequestToken
    );
    if (!sendEmail) {
      return res
        .status(400)
        .send({ message: "An error occured, please try again !" });
    }
    return res.send({
      message: "An email has been sent to you account with the reset link .",
    });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Error while processing your request" });
  }
};

export const ResetPassword = async (req, res) => {
  try {
    const AuthHeaders = req.headers.authorization;
    if (!AuthHeaders) {
      console.log("auth headers not found");
      return res.status(400).send({ message: "Token not found" });
    }
    const { newpassword1, newpassword2 } = req.body;

    if (
      !newpassword1 ||
      !newpassword2 ||
      typeof newpassword1 !== "string" ||
      typeof newpassword2 !== "string"
    ) {
      console.log("password does not match");
      return res.status(400).send({ message: "Invalid password type" });
    } else if (newpassword2 !== newpassword1) {
      console.log("auth headers not found");
      return res.status(401).send({ message: "Password did not match" });
    }

    const Resettoken = AuthHeaders.split(" ")[1];
    try {
      const decoded = jwt.verify(Resettoken, process.env.JWT_SECRET);
      // Token is valid - use decoded data
      const userId = decoded.user_id;

      const HashedPassword = await bcrypt.hash(newpassword1, 8);

      if (!HashedPassword) {
        console.log("error generating new password");
        return res
          .status(400)
          .json({ message: "Error setting up you account ." });
      }

      const { data, error } = await supabase
        .from("users")
        .update({ password: HashedPassword })
        .eq("id", userId);
      if (error) {
        console.error(`password update error from db : ${error}`);
        return res.status(400).send({ message: "An error occured" });
      }
      await EmailServices.sendPasswordResetSuccessEmail({
        username: decoded.username,
        email: decoded.email,
      });
      return res.status(200).send({ message: "Password reset successfully!" });
      // Proceed with password reset
    } catch (error) {
      return res
        .status(400)
        .send({ message: "Invalid or expired token. Please try again." });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: "Error while processing your request" });
  }
};
// Store tokens in the database;
const StoreTokens = async (RefreshToken, AuthToken, id) => {
  try {
    if (!RefreshToken || !AuthToken || !id || typeof id !== "string") {
      return { error: "No token found" };
    }

    // Check if a token record already exists for this user
    const { data, error } = await supabase
      .from("Tokens")
      .select("user_id")
      .eq("user_id", id)
      .single();

    // if the user_id is present in the database
    //update the authToken and refreshToken
    if (data?.user_id) {
      // Update existing token record
      const { error: updateError } = await supabase
        .from("Tokens")
        .update({ Access_Token: AuthToken, Refresh_Token: RefreshToken })
        .eq("user_id", id);
      if (updateError) {
        return { error: updateError };
      }
    } else {
      // Insert new token record
      const { error: insertError } = await supabase.from("Tokens").insert({
        Refresh_Token: RefreshToken,
        Access_Token: AuthToken,
        user_id: id,
      });
      if (insertError) {
        return { error: insertError };
      }
    }

    return { message: "Token stored successfully" };
  } catch (err) {
    console.error(err);
    return { error: err };
  }
};
//get user account details

// Function to get user details
export const GetUserData = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(`username, created_at, email, id,isVerified`)
      .eq("id", user_id)
      .single();

    if (error) {
      console.error("Supabase error (GetUserData):", error);
      return { error };
    }
    return { data };
  } catch (error) {
    console.error("Exception (GetUserData):", error);
    return { error };
  }
};

// Function to get user contributions
export const GetUserContributions = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from("Contributions")
      .select("*")
      .eq("user_id", user_id)
      .eq("Document_visibility", "Private");

    if (error) {
      console.error("Supabase error (GetUserContributions):", error);
      return { error };
    }
    return { data: data || [] };
  } catch (error) {
    console.error("Exception (GetUserContributions):", error);
    return { error };
  }
};

// Function to get user question count
export const GetUserQuestionAskedCount = async (user_id) => {
  try {
    const { count, error } = await supabase
      .from("Conversation_History")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user_id);

    if (error) {
      console.error("Supabase error (GetUserQuestionAskedCount):", error);
      return { error };
    }
    return { count: count || 0 };
  } catch (error) {
    console.error("Exception (GetUserQuestionAskedCount):", error);
    return { error };
  }
};

// Function to get user likes
export const GetUserLikeCount = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from("Contributions")
      .select(
        "created_at, chunk_count, Doc_Feedback(upvotes, downvotes, partial_upvotes)"
      )
      .eq("user_id", user_id)
      .eq("Document_visibility", "Public");

    if (error) {
      console.error("Supabase error (GetUserLikeCount):", error);
      return { error };
    }
    return { data: data || [] };
  } catch (error) {
    console.error("Exception (GetUserLikeCount):", error);
    return { error };
  }
};

// Function to get user chat rooms
export const GetUserChatRooms = async (user_id) => {
  try {
    const { data: chatrooms, error: chatRoomError } = await supabase
      .from("Room_and_Members")
      .select("member_id, room_id, chat_rooms(*)")
      .eq("member_id", user_id);

    if (chatRoomError) {
      console.error("Supabase error (GetUserChatRooms):", chatRoomError);
      return { error: chatRoomError };
    }
    return { data: chatrooms || [] };
  } catch (error) {
    console.error("Exception (GetUserChatRooms):", error);
    return { error };
  }
};
export const CountNotifications = async (user_id) => {
  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("user_id", { count: "exact", head: true })
      .eq("user_id", user_id);
    if (error) {
      console.error("Supabase error (CountNotifications):", error);
      return { error: error };
    }
    return { notificationcount: count || 0 };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

export const GetNotificationsInformations = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user_id);
    if (error) {
      console.error("Supabase error (CountNotifications):", error);
      return { error: error };
    }

    return { notifications: data || [] };
  } catch (err) {
    console.error(err);
    return { err };
  }
};
// Main function to get all user data
export const GetUserAccountDetails = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    if (!user_id || typeof user_id !== "string") {
      console.log("No user id found while getting account details");
      return res.status(400).json({ message: "Invalid user id" });
    }
    const username = req.user.username ? req.user.username : "unkown1";
    // unique userKye for caching
    const user_cache_key = `username=${username}&user_id=${user_id}`;

    const userdata = await getUserDataFromCache(user_cache_key);
    // if there is cache info
    const hasCachedData =
      userdata.userData.length > 0 ||
      userdata.Contributions_user_id_fkey.length > 0 ||
      userdata.Querycount > 0 ||
      userdata.chatrooms.length > 0;
    userdata.notificationcount !== 0 ||
      userdata.notifications.length > 0 ||
      userdata.FeedbackCounts !== 0;

    if (hasCachedData && !userdata.error) {
      console.log("Serving from cache");
      return res.status(200).send({
        user: userdata.userData,
        Contributions_user_id_fkey: userdata.Contributions_user_id_fkey,
        Querycount: userdata.Querycount,
        FeedbackCounts: userdata.FeedbackCounts,
        chatrooms: userdata.chatrooms,
        notificationcount: userdata.notificationcount,
        notifications: userdata.notifications,
        message: "User data found",
      });
    }
    // Fetch all data in parallel to improve performance
    const [
      userData,
      countData,
      votesData,
      chatroomsData,
      Contributions_user_id_fkey,
      notificationcount,
      notifications,
    ] = await Promise.all([
      GetUserData(user_id),
      GetUserQuestionAskedCount(user_id),
      GetUserLikeCount(user_id),
      GetUserChatRooms(user_id),
      GetUserContributions(user_id),
      CountNotifications(user_id),
      GetNotificationsInformations(user_id),
    ]);

    // Consistent error handling
    if (userData.error) {
      console.error("Failed to fetch user data:", userData.error);
      return res.status(404).send({ message: "User not found" });
    }
    if (countData.error || votesData.error || chatroomsData.error) {
      console.error(
        "Failed to fetch additional data:",
        countData.error,
        votesData.error,
        chatroomsData.error
      );
      return res.status(500).send({ message: "Error fetching user data" });
    }
    const StoreInCache = await StoreUserDataInTheCache(
      user_cache_key,
      userData.data,
      Contributions_user_id_fkey.data,
      countData.count,
      votesData?.data?.length > 0 ? votesData.data[0].Doc_Feedback : 0,
      chatroomsData.data,
      notificationcount.notificationcount,
      notifications.notifications
    );

    if (StoreInCache?.error) {
      console.error(`Erro while caching:${StoreInCache?.error}`);
    }
    // Return the combined data
    return res.json({
      user: userData.data,
      Contributions_user_id_fkey: Contributions_user_id_fkey.data,
      Querycount: countData.count,
      FeedbackCounts:
        votesData?.data?.length > 0 ? votesData.data[0].Doc_Feedback : null,
      chatrooms: chatroomsData.data,
      notificationcount: notificationcount.notificationcount,
      notifications: notifications.notifications,
      message: "User data found",
    });
  } catch (error) {
    console.error("Server exception:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// check user information in redis cache
const getUserDataFromCache = async (base_key) => {
  if (!base_key) {
    return { error: "No valid key found" };
  }

  try {
    const [
      userData,
      Contributions_user_id_fkey,
      Querycount,
      FeedbackCounts,
      chatrooms,
      notificationcount,
      notifications,
    ] = await Promise.all([
      redisClient.get(`${base_key}_userData`).catch(() => null),
      redisClient.get(`${base_key}_Contributions`).catch(() => null),
      redisClient.get(`${base_key}_QueryCount`).catch(() => null),
      redisClient.get(`${base_key}_FeedbackCounts`).catch(() => null),
      redisClient.get(`${base_key}_chatrooms`).catch(() => null),
      redisClient.get(`${base_key}_notificationcount`).catch(() => null),
      redisClient.get(`${base_key}_notifications`).catch(() => null),
    ]);

    return {
      userData: userData ? JSON.parse(userData) : [],
      Contributions_user_id_fkey: Contributions_user_id_fkey
        ? JSON.parse(Contributions_user_id_fkey)
        : [],
      Querycount: Querycount ? parseInt(Querycount) : 0,
      FeedbackCounts: FeedbackCounts ? parseInt(FeedbackCounts) : 0,
      chatrooms: chatrooms ? JSON.parse(chatrooms) : [],
      notificationcount: notificationcount ? parseInt(notificationcount) : 0,
      notifications: notifications ? JSON.parse(notifications) : [],
    };
  } catch (error) {
    console.error("Redis cache error:", error);
    return {
      userData: [],
      Contributions_user_id_fkey: [],
      Querycount: 0,
      FeedbackCounts: 0,
      chatrooms: [],
      notificationcount: 0,
      notifications: [],
    };
  }
};

// store the user data in the cache
const StoreUserDataInTheCache = async (
  base_key,
  userdata,
  Contributions,
  querycount,
  feedbackcount,
  rooms,
  notifycount,
  notify
) => {
  if (!base_key) {
    return { error: "Invalid base_key" };
  }

  try {
    await Promise.all([
      redisClient
        .set(`${base_key}_userData`, JSON.stringify(userdata), {
          expiration: {
            type: "EX",
            value: 600,
          },
        })
        .catch(() => null),
      redisClient
        .set(`${base_key}_Contributions`, JSON.stringify(Contributions), {
          expiration: {
            type: "EX",
            value: 600,
          },
        })
        .catch(() => null),
      redisClient
        .set(`${base_key}_QueryCount`, JSON.stringify(querycount), {
          expiration: {
            type: "EX",
            value: 600,
          },
        })
        .catch(() => null),
      redisClient
        .set(`${base_key}_FeedbackCounts`, JSON.stringify(feedbackcount), {
          expiration: {
            type: "EX",
            value: 600,
          },
        })
        .catch(() => null),
      redisClient
        .set(`${base_key}_chatrooms`, JSON.stringify(rooms), {
          expiration: {
            type: "EX",
            value: 600,
          },
        })
        .catch(() => null),
      redisClient
        .set(`${base_key}_notificationcount`, JSON.stringify(notifycount), {
          expiration: {
            type: "EX",
            value: 600,
          },
        })
        .catch(() => null),
      redisClient
        .set(`${base_key}_notifications`, JSON.stringify(notify), {
          expiration: {
            type: "EX",
            value: 600,
          },
        })
        .catch(() => null),
    ]);
  } catch (error) {
    console.error(`Error while Storing information in the cache ${error}`);
    return { error };
  }
};

// Accept or reject room joining request

export const Accept_Or_rejectRequest = async (req, res) => {
  try {
    const io = getIo();

    const user_id = req.user.user_id;

    if (!user_id || typeof user_id !== "string" || !req.user.username) {
      console.log("Accept_Or_rejectRequest error in user_id");
      return res.status(400).json({ message: "Invalid user id" });
    }

    const { action_type, requested_user_id, room_id, room_name, admin_id } =
      req.params;

    // action type is either accept or reject
    // admin_id is the id of the admin of the room who recieved the notification
    // requested_userid is the id of the user sent the room joining request
    // the room_id and room_name have their values in their name
    if (!action_type || !requested_user_id || !room_id || !room_name) {
      return res.status(400).send({ message: "All parameters are required" });
    }

    // check whether a room is full or not
    const isFull = await checkRoomMemberLimit(room_id);

    if (isFull.message === "Room-full") {
      return res.send({ message: "Room is full" });
    }

    // if the request is accepted
    if (action_type === "Accepted") {
      // first delete the notification connected to the admin_id from the table and the room_id of which user is the admin
      const { data, error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user_id)
        .eq("metadata->>room_id", room_id);
      if (error) {
        console.error(error);
        return res.status(400).send({ message: "Unable to join the room" });
      }
      // then store the new notification to send the user who requested the roomJoining
      // join the user fu
      const AddInRoom = await JoinTheUser(room_id, requested_user_id);
      if (AddInRoom.error) {
        console.error(AddInRoom.error);
        return res.status(400).send({ message: "Unable to join the room" });
      }

      const metadata = {
        room_id: room_id,
        sent_by_username: "System",
        sent_by_id: "System",
      };
      const notification_type = "Informatory";
      const notification_message = `You have been added to room ${room_name} by the admin ${req.user.username}`;
      //create a new notification for the users who has been just added to the room
      const newNotification = await StoreNotifications(
        metadata,
        requested_user_id,
        notification_type,
        notification_message,
        "NA"
      );

      console.log(newNotification);
      io.to(requested_user_id).emit("new_Notification", newNotification || []);

      return res.status(200).send({ message: "Request has been accepted !" });
    } else {
      // Rejected
      const { data, error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user_id)
        .eq("metadata->>room_id", room_id);
      if (error) {
        console.error(error);
        return res.status(200).send({ message: "Rejected the request !" });
      }
      const now = new Date();
      const metadata = {
        room_id: room_id,
        sent_by_username: "System",
        sent_by_id: "System",
      };
      const notification_type = "Informatory";
      const notification_message = `You request to join ${room_name} has been rejected by the admin ${req.user.username}`;
      //create a new notification for the users who has been just added to the room
      const newNotification = await StoreNotifications(
        metadata,
        requested_user_id,
        notification_type,
        notification_message,
        "NA"
      );

      // console.log(newNotification);
      io.to(requested_user_id).emit("new_Notification", newNotification || []);
      // get the users notifications and send them to them
      return res.status(200).send({
        message: ` Your request to join the room ${room_name} has been rejected  by the room admin`,
      });
    }
  } catch (error) {
    console.error("Server exception:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GetAllUserNotifications = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user_id);
    if (error || !data) {
      return [];
    }
    return data;
  } catch (error) {
    throw new Error(error);
  }
};

export const StoreNotifications = async (
  metadata,
  idOfPersonWhoToSendNotification,
  notification_type,
  notification_message,
  username
) => {
  try {
    // username value is jut to create a message
    const { data: newNotification, error: insertError } = await supabase
      .from("notifications")
      .insert({
        user_id: idOfPersonWhoToSendNotification,
        notification_type: notification_type,
        notification_message: notification_message,
        title: "Room-joining-request",
        metadata: metadata,
      })
      .select("*");

    if (insertError) {
      return [];
    }
    return newNotification;
  } catch (error) {
    throw new Error(error);
  }
};

export const DeleteNotification = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    if (!user_id || typeof user_id !== "string") {
      console.log("No user id found while getting account details");
      return res.status(400).json({ message: "Invalid user id" });
    }

    const { notification_id } = req.params;

    const { data, error } = await supabase
      .from("notifications")
      .delete("*")
      .eq("id", notification_id);

    if (error) {
      console.error(error);
      return res.status(400).send({ message: "Something went wrong" });
    }

    return res.send({ message: "deleted" });
  } catch (error) {
    console.error("Server exception:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
