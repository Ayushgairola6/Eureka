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
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
export const GenerateRefreshTokens = (
  id,
  email,
  username,
  AllowedTrainingModels
) => {
  try {
    if (!id || !email || !username) {
      throw new Error("Missing payload for Refresh Token");
    }

    return jwt.sign(
      {
        user_id: id,
        email,
        username,
        isVerified: true,
        AllowedTrainingModels: AllowedTrainingModels || "YES",
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
  } catch (err) {
    console.error("Refresh Token Generation Error:", err);
    return null;
  }
};

const GenerateEmailVerificationTokens = (username, email) => {
  try {
    const Secret = process.env.JWT_SECRET;
    const VerificationToken = jwt.sign(
      { email: email, username: username, isVerified: false },
      Secret,
      { expiresIn: "24h" } // ← Use string format
    );

    return VerificationToken;
  } catch (error) {
    console.error("Token generation error:", error);
    return null; // Return null instead of error object
  }
};
export const GenerateAccessTokens = (
  id,
  email,
  username,
  AllowedTrainingModels
) => {
  try {
    if (!id || !email || !username) {
      throw new Error("Missing payload for Access Token");
    }

    return jwt.sign(
      {
        user_id: id,
        email,
        username,
        isVerified: true,
        AllowedTrainingModels: AllowedTrainingModels || "YES",
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
  } catch (err) {
    console.error("Access Token Generation Error:", err);
    return null; // Return null so the controller knows it failed
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
      .select("*")
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
      email: email.toLowerCase(),
      password: HashedPassword,
      AllowedTrainingModels: "TRUE",
    });

    if (NewUserAccount.error) {
      return res
        .status(400)
        .json({ message: "Error setting up you account ." });
    }

    const user = { username: username, email: email };
    // send welcome email with verify account email
    const welcomeEmail = await EmailServices.sendWelcomeEmail(user).catch(
      async (error) =>
        await notifyMe("Error while sending an email for registration", error)
    );
    const verificationtoken = GenerateEmailVerificationTokens(username, email);

    const verificationEmail = await EmailServices.sendAccountVerficicationEmail(
      user,
      verificationtoken
    );

    notifyMe(`New user ${username} joined AntiNode`);
    return res.json({
      message: "An email has been sent to your registered email !",
    });
  } catch (error) {
    notifyMe("Error while handling user registration", error);
    return res
      .status(500)
      .json({ message: "Error while creating an account !" });
  }
};

// User login Controller
export const HandleUserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      return res.status(400).json({ message: "Invalid information" });
    }

    // normalize the email Id
    const normalizedEmail = email.toLowerCase();

    // Extract user data from db
    const { data: user, error: userError } = await supabase
      .from("users")
      .select(
        "email, id, username, password, isVerified,AllowedTrainingModels, Tokens(Refresh_Token)"
      )
      .eq("email", normalizedEmail)
      .single();

    // console.log(user);
    // if the user is not found in the database or some error occured
    if (userError || !user) {
      // console.log(userError);
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your account first" });
    }

    // Verify password
    const isMatching = await bcrypt.compare(password, user.password);
    // if the password does not match
    if (!isMatching) {
      return res.status(400).json({ message: "Password did not match" });
    }

    // genrate new tokens for the user
    const ValidAuthToken = GenerateAccessTokens(
      user.id,
      user.email,
      user.username,
      user.AllowedTrainingModels
    );
    const RefreshToken = GenerateRefreshTokens(
      user.id,
      user.email,
      user.username,
      user.AllowedTrainingModels
    );

    // Store new tokens in database
    const store = await StoreTokens(
      RefreshToken,
      ValidAuthToken,
      user.id,
      user.username
    );
    if (store.error) {
      await notifyMe(
        `Unable to store user tokens: ${JSON.stringify(store.error)}`,
        store.error
      );
      return res
        .status(400)
        .json({ message: "Error while creating a session" });
    }

    // Cache the new refresh token
    await cacheRefreshToken(user, RefreshToken);

    const { error } = await supabase
      .from("Payments")
      .upsert(
        { user_id: user.id, plan_type: "free", plan_status: "active" },
        { onConflict: "user_id" }
      );
    if (error) {
      await notifyMe(
        "The authController failed while inserting the payment status into the database",
        error
      );
      return res.status(400).send({ message: "Something went wrong" });
    }
    // Set cookie
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("AntiNode_eta_six_version1_AuthToken", ValidAuthToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      ...(isProduction && { domain: ".antinodeai.space" }),
      maxAge: 24 * 60 * 60 * 1000,
    });
    // Send login notification
    sendLoginNotification(req, user);

    return res.status(200).json({
      message: "Login successful",
    });
  } catch (error) {
    // console.error("Login controller error:", error);
    await notifyMe(`Login controller error:`, error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
//update the user cookies
export const updateCookies = async (req, res) => {
  try {
    const newAccessToken = req.headers.authorization.split(" ")[1];
    if (!newAccessToken) {
      return res.status(401).send({ message: "The token was not found" });
    }
    res.cookie("AntiNode_eta_six_version1_AuthToken", newAccessToken, {
      httpOnly: true,
      secure: true, // Required for sameSite: "none"
      sameSite: "none", // Allows the cookie to survive the jump from api. to www.
      domain: ".antinodeai.space", // The leading dot is the "Subdomain Unlock"
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.send({ message: "cookies updated" });
  } catch (error) {
    await notifyMe(
      "An error occured while updating the client side cookies",
      error
    );
  }
};
// checking for previous refreshtoken validity helper function
const CheckPastToken = async (user) => {
  // Check if existing refresh token is valid and exists
  const existingRefreshToken = user.Tokens?.[0]?.Refresh_Token;
  // if the refreshToken exists so that means user is not new
  if (existingRefreshToken) {
    // verify that token
    try {
      const isValidRefreshToken = jwt.verify(
        existingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      // Generate new access token only for new session
      const authToken = GenerateAccessTokens(
        user.id,
        user.email,
        user.username,
        user.AllowedTrainingModels
      );

      if (!authToken) {
        await notifyMe(
          "Access token generation failed for existing session",
          "No auth token"
        );
        return { error: "Failed to create a new session token" };
      }

      // Update access token in database
      const { error: tokenError } = await supabase
        .from("Tokens")
        .update({ Access_Token: authToken })
        .eq("user_id", user.id);

      if (tokenError) {
        await notifyMe("token updation error", tokenError);
        return { error: tokenError };
      }

      // Cache the already created refresh token
      await cacheRefreshToken(user, existingRefreshToken);
      // return the new auth/session token to the user
      return { AuthToken: authToken };
    } catch (refreshTokenError) {
      await notifyMe("RefreshToken error", refreshTokenError);
      // Refresh token is invalid, proceed to generate new tokens
      return { error: "No existing token found" };
    }
  }
};
//google auth handler

// Helper function to cache refresh token
const cacheRefreshToken = async (user, refreshToken) => {
  const refreshTokenKey = `user=${user.username}_userId=${user.id}`;
  try {
    await redisClient
      .multi()
      .set(refreshTokenKey, JSON.stringify(refreshToken))
      .expire(refreshTokenKey, 1000);
  } catch (error) {
    return { error };
  }
};

// Helper function for login notification
const sendLoginNotification = async (req, user) => {
  try {
    const clientIp =
      req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress;

    await notifyMe(
      `User ${user.username} logged into their AntiNode account from IP: ${clientIp}`
    );

    // Uncomment if you want to send email notifications
    await EmailServices.sendLoginNotification(user, {
      ip: clientIp,
      userAgent: req.headers["user-agent"],
      browser: req.headers["sec-ch-ua"],
      platform: req.headers["sec-ch-ua"],
      timestamp: new Date(),
    });
  } catch (error) {
    await notifyMe("Error while sending login email to the user", error);
  }
};
// user logout handler
export const HandleUserLogout = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    if (!user_id || !req.user.username) {
      return res.status(401).send({ message: "Please log in to continue" });
    }

    const { error } = await supabase
      .from("Tokens")
      .delete("*")
      .eq("user_id", user_id);
    if (error) {
      return res
        .status(400)
        .send({ message: "Unable to log out of your account" });
    }
    const RefreshTokenKey = `user=${req.user.username}'s_userId=${user_id}`;
    await redisClient.del(RefreshTokenKey);
    res.clearCookie("AntiNode_eta_six_version1_AuthToken");
    return res.status(200).send({ message: "Session revoked" });
  } catch (error) {
    return res.status(500).send({ message: "Unable to logout " });
  }
};

// verify the users email address and log him in into his account for first time automatically
export const VerifyEmail = async (req, res) => {
  try {
    const token = req.params.verificationtoken;

    if (!token) {
      notifyMe(
        `Token for was not found in the parameters in verifyEmail controller`
      );
      return res.status(400).send({ message: "Verification token not found" });
    }
    const Secret = process.env.JWT_SECRET;

    let decoded;
    try {
      decoded = jwt.verify(token, Secret);
    } catch (jwterror) {
      await notifyMe("Email verifficationtoken expired");
      return res.status(400).send({ message: "Link expired" });
    }

    // check if the user is already verified
    const email = decoded.email;
    const { data, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    if (dbError) {
      notifyMe(
        `An error occured while checking the verfication start of a user in the db`,
        dbError
      );
      return res.status(400).send({
        message: "Error while verifying you account , please try again later!",
      });
    }

    if (data.isVerified === true) {
      return res
        .status(200)
        .send({ message: "Account already verified  Please login instead" });
    }
    // else update the user verification status
    const { error } = await supabase
      .from("users")
      .update({ isVerified: true })
      .eq("email", email);
    if (error) {
      notifyMe(
        `account verification error ${JSON.stringify(error)} for user`,
        error
      );
      return res
        .status(400)
        .send({ message: "Error while verifying your account" });
    }

    // logg the user in for the first time automatically;
    const AuthToken = GenerateAccessTokens(
      data.id,
      data.email,
      data.username,
      data.AllowedTrainingModels
    );

    if (!AuthToken) {
      return res.status(400).send({ message: "An error occurred" });
    }

    const RefreshToken = GenerateRefreshTokens(
      data.id,
      data.email,
      data.username,
      data.AllowedTrainingModels
    );
    if (!RefreshToken) {
      return res.status(400).send({ message: "An error occurred" });
    }

    const store = await StoreTokens(
      RefreshToken,
      AuthToken,
      data.id,
      data.username
    );
    if (store.error) {
      notifyMe(
        `Error while storing the tokens in the db for user= ${
          data.username
        } error message=${JSON.stringify(store.error)}`
      );
      return res
        .status(400)
        .json({ message: "Error while logging in please try again later !" });
    }

    res.cookie("AntiNode_eta_six_version1_AuthToken", AuthToken, {
      httpOnly: true,
      secure: true,
      domain: ".antinodeai.space",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .send({ message: "Account verified", AuthToken: AuthToken });
  } catch (error) {
    await notifyMe(`error in verifyemail function`, error);
    return res.status(500).send({ message: "Something went wrong " });
  }
};
// generate access token

// Get a new email
export const GetVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({ message: "Invalid email address" });
    }
    const { data, error } = await supabase
      .from("users")
      .select("isVerified,username")
      .eq("email", email.toLowerCase())
      .single();
    if (!data) {
      return res.status(404).send({ message: "No such user found" });
    }
    if (error) {
      await notifyMe(
        `${JSON.stringify(error)} Error while getting user info from the db`
      );
      return res.status(404).send({ message: "No such user found" });
    }
    if (data.isVerified === true) {
      return res.status(200).send({ message: "Account already verified" });
    }

    const user = { username: data.username, email: email };
    // send welcome email with verify account email
    const welcomeEmail = await EmailServices.sendWelcomeEmail(user).catch(
      (error) => console.error("Register email failed ;", error)
    );
    const verificationtoken = GenerateEmailVerificationTokens(
      data.username,
      email
    );

    if (!verificationtoken) {
      return res.status(400).send({ message: "Please try again !" });
    }
    try {
      const verificationEmail =
        await EmailServices.sendAccountVerficicationEmail(
          user,
          verificationtoken
        );
    } catch (emailError) {
      if (!emailError) {
        await notifyMe(
          `Email services running down = ${JSON.stringify(emailError)}`
        );
        return res.status(400).send({ message: "Something went wrong" });
      }
    }

    return res.send({
      message: "An email has been sent to you with the verification link",
    });
  } catch (err) {
    await notifyMe(
      `Error while sending the new verification Email to the user= ${JSON.stringify(
        err
      )}`
    );
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

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
      return res.status(400).send({ message: "Token not found" });
    }
    const { newpassword1, newpassword2 } = req.body;

    if (
      !newpassword1 ||
      !newpassword2 ||
      typeof newpassword1 !== "string" ||
      typeof newpassword2 !== "string"
    ) {
      return res.status(400).send({ message: "Invalid password type" });
    } else if (newpassword2 !== newpassword1) {
      return res.status(401).send({ message: "Password did not match" });
    }

    const Resettoken = AuthHeaders.split(" ")[1];
    try {
      const decoded = jwt.verify(Resettoken, process.env.JWT_SECRET);
      // Token is valid - use decoded data
      const userId = decoded.user_id;

      const HashedPassword = await bcrypt.hash(newpassword1, 8);

      if (!HashedPassword) {
        return res
          .status(400)
          .json({ message: "Error setting up you account ." });
      }

      const { data, error } = await supabase
        .from("users")
        .update({ password: HashedPassword })
        .eq("id", userId);
      if (error) {
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
    return res
      .status(500)
      .send({ message: "Error while processing your request" });
  }
};
// Store tokens in the database;
export const StoreTokens = async (
  RefreshToken,
  AuthToken,
  user_id,
  username
) => {
  try {
    if (
      !RefreshToken ||
      !AuthToken ||
      !user_id ||
      typeof user_id !== "string" ||
      !username
    ) {
      await notifyMe(`Some data is not available at the store token function`);
      return { error: "No token found" };
    }

    //upsert the tokens and check for user_id being unique
    const { error } = await supabase.from("Tokens").upsert(
      {
        user_id: user_id,
        Refresh_Token: RefreshToken,
        Access_Token: AuthToken,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      return { error: error };
    }
    // Add both tokens to the cache - FIXED THIS LINE
    const RefreshTokenKey = `user=${username}'s_userId=${user_id}`;
    await redisClient
      .multi()
      .set(RefreshTokenKey, JSON.stringify(RefreshToken))
      .expire(RefreshTokenKey, 800);

    return { message: "Token stored successfully" };
  } catch (err) {
    await notifyMe("Error in store token function", err);
    return { error: err };
  }
};
//get user account details

const emptyResponse = (data = []) => ({ data, error: null });

export const GetUserData = async (user_id) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user_id)
    .single();
  return error ? { data: null, error } : { data, error: null };
};

export const GetUserContributions = async (user_id) => {
  const { data, error } = await supabase
    .from("Contributions")
    .select("created_at,feedback,document_id,user_id,chunk_count,id")
    .eq("user_id", user_id)
    .eq("Document_visibility", "Private");
  return error ? emptyResponse() : { data, error: null };
};

export const GetUserQuestionAskedCount = async (user_id) => {
  const date = new Date();
  const currentMonthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
  const { data, error } = await supabase
    .from("Question_Rate_Limits")
    .select("question_asked_count")
    .eq("user_id", user_id)
    .eq("Month-Year", currentMonthKey)
    .maybeSingle(); // Better than .single() for new users
  return { count: data?.question_asked_count || 0, error: null };
};

export const GetUserLikeCount = async (user_id) => {
  try {
    const { data, error } = await supabase.rpc("count_votes_by_user", {
      p_user_id: user_id,
    });
    if (error) throw error;
    return {
      data: data?.[0] || { upvotes: 0, downvotes: 0, partial_upvotes: 0 },
      error: null,
    };
  } catch (err) {
    return {
      data: { upvotes: 0, downvotes: 0, partial_upvotes: 0 },
      error: null,
    };
  }
};

export const GetUserChatRooms = async (user_id) => {
  const { data, error } = await supabase
    .from("Room_and_Members")
    .select("member_id, room_id, chat_rooms(*)")
    .eq("member_id", user_id);
  // Return empty array even on error to keep the UI from crashing
  return { data: data || [], error: null };
};

export const GetNotificationsInformations = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user_id);
    if (error) {
      // console.error("Supabase error (CountNotifications):", error);
      return { error: error, notifications: [] };
    }

    return { notifications: data || [], error: null };
  } catch (error) {
    return { error, notifications: [] };
  }
};
// Main function to get all user data
export const GetUserAccountDetails = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const username = req.user.username || "unknown_user";

    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const cacheKey = `user:${user_id}:dashboard`;

    // 1. Check Cache
    const cachedData = await redisClient.hGetAll(cacheKey);
    if (cachedData && cachedData.userdata) {
      return res.status(200).json({
        user: JSON.parse(cachedData.userdata),
        Contributions_user_id_fkey: JSON.parse(cachedData.Contributions),
        Querycount: parseInt(cachedData.querycount) || 0,
        FeedbackCounts: JSON.parse(cachedData.feedbackcount),
        chatrooms: JSON.parse(cachedData.rooms),
        notificationcount: parseInt(cachedData.notificationcount) || 0,
        notifications: JSON.parse(cachedData.notification),
        fromCache: true,
        message: "Data retrieved from cache",
      });
    }

    const [
      userData,
      countData,
      votesData,
      chatroomsData,
      contributionsData,
      notifyData,
    ] = await Promise.all([
      GetUserData(user_id),
      GetUserQuestionAskedCount(user_id),
      GetUserLikeCount(user_id),
      GetUserChatRooms(user_id),
      GetUserContributions(user_id),
      GetNotificationsInformations(user_id),
    ]);

    if (!userData.data) {
      return res.status(404).json({ message: "User profile not found" });
    }

    const finalResponse = {
      user: userData.data,
      Contributions_user_id_fkey: contributionsData.data,
      Querycount: countData.count,
      FeedbackCounts: votesData.data,
      chatrooms: chatroomsData.data,
      notificationcount: notifyData.notifications?.length || 0,
      notifications: notifyData.notifications || [],
      message: "Data synced successfully",
    };

    // 4. Fire-and-forget caching (Don't await this, speed up response)
    StoreUserDataInTheCache(user_id, cacheKey, finalResponse).catch((err) =>
      console.error("Cache background error:", err)
    );

    return res.json(finalResponse);
  } catch (error) {
    notifyMe(
      `CRITICAL: Dashboard Failure for ${req.user.username}: ${error.message}`
    );
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// store the user data in the cache
const StoreUserDataInTheCache = async (user_id, cacheKey, data) => {
  try {
    await redisClient.hSet(cacheKey, {
      userdata: JSON.stringify(data.user),
      Contributions: JSON.stringify(data.Contributions_user_id_fkey),
      querycount: data.Querycount.toString(),
      feedbackcount: JSON.stringify(data.FeedbackCounts),
      rooms: JSON.stringify(data.chatrooms),
      notificationcount: data.notificationcount.toString(),
      notification: JSON.stringify(data.notifications),
    });

    // Set TTL to end of day
    const now = new Date();
    const endOfDay = new Date(now).setHours(23, 59, 59, 999);
    const ttl = Math.floor((endOfDay - now) / 1000);

    await redisClient.expire(cacheKey, ttl > 0 ? ttl : 3600);
    return { success: true };
  } catch (error) {
    return { error };
  }
};

// Accept or reject room joining request

export const Accept_Or_rejectRequest = async (req, res) => {
  try {
    const io = getIo();

    const user_id = req.user.user_id;

    if (!user_id || typeof user_id !== "string" || !req.user.username) {
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
        return res.status(400).send({ message: "Unable to join the room" });
      }
      // then store the new notification to send the user who requested the roomJoining
      // join the user fu
      const AddInRoom = await JoinTheUser(room_id, requested_user_id);
      if (AddInRoom.error) {
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
      .select("*")
      .single();

    if (insertError) {
      return [];
    }
    return newNotification;
  } catch (error) {
    throw new Error(error);
  }
};

// deleting notificaiton from db and cache if exists
export const DeleteNotification = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    if (!user_id || typeof user_id !== "string") {
      // console.log("No user id found while getting account details");
      return res.status(400).json({ message: "Invalid user id" });
    }

    const { notification_id } = req.params;

    const key = `user_id=${user_id}'s_dashboardData`;

    // if the data of the key exists in the cache
    const exists = await redisClient.exists(key);
    if (exists) {
      // get the notifications then remove the notification from it
      const AllNotitifications = await redisClient.exists(key);
      if (AllNotitifications) {
        const notifications = await redisClient.hGet(key, "notification");
        const ParsedNotifications = JSON.parse(notifications);
        const indexOfId = ParsedNotifications.find(
          (e) => e.id === notification_id
        );
        // delete the items from it and update the cache
        ParsedNotifications.splice(indexOfId, 1);
        //perform all operations at once
        await redisClient
          .multi()
          .hSet(key, "notification", JSON.stringify(ParsedNotifications))
          .hSet(
            key,
            "notificationcount",
            JSON.stringify(ParsedNotifications.length)
          )
          .exec();
      }
    }
    const { data, error } = await supabase
      .from("notifications")
      .delete("*")
      .eq("id", notification_id);

    if (error) {
      // console.error(error);
      return res.status(400).send({ message: "Something went wrong" });
    }

    return res.send({ message: "deleted" });
  } catch (error) {
    // console.error("Server exception:", error);
    await notifyMe("Notification deletion controller error", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
