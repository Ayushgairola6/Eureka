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
      { user_id: id, email: email, username: username, isVerified: true },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "20d" }
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
      { user_id: id, email: email, username: username, isVerified: true },
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
      email: email.toLowerCase(),
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

    await notifyMe(`New user ${username} joined eureka`);
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
        "email, id, username, password, isVerified, Tokens(Refresh_Token)"
      )
      .eq("email", normalizedEmail)
      .single();

    // if the user is not found in the database or some error occured
    if (userError || !user) {
      await notifyMe(
        `User not found or error in login: ${JSON.stringify(userError)}`,
        userError
      );
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
    let ValidAuthToken;
    // the default RefreshToken
    let RefreshToken;
    // check for the validity of older refreshToken
    const isStillValid = await CheckPastToken(user);
    // if the token is validated and a new authToken has been generated
    if (!isStillValid?.error && isStillValid?.AuthToken) {
      ValidAuthToken = isStillValid.AuthToken;
      RefreshToken = user.Tokens[0].Refresh_Token;
    } else {
      // else generate a new session Token and refreshToken
      ValidAuthToken = GenerateAccessTokens(user.id, user.email, user.email);
      RefreshToken = GenerateRefreshTokens(user.id, user.email, user.username);
    }
    // Generate new tokens if no valid refresh token exists

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

    // Set cookie
    res.cookie("Eureka_eta_six_version1_AuthToken", ValidAuthToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Send login notification
    // await sendLoginNotification(req, user);

    return res.status(200).json({
      message: "Login successful",
      AuthToken: ValidAuthToken,
    });
  } catch (error) {
    console.error("Login controller error:", error);
    await notifyMe(`Login controller error: ${JSON.stringify(error)}`);
    return res.status(500).json({ message: "Something went wrong" });
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
        user.username
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
      return { error: refreshTokenError };
    }
  }
};
//google auth handler

// Helper function to cache refresh token
const cacheRefreshToken = async (user, refreshToken) => {
  const refreshTokenKey = `user=${user.username}_userId=${user.id}`;
  try {
    await redisClient.set(refreshTokenKey, JSON.stringify(refreshToken), {
      expiration: { type: "EX", value: 800 },
    });
  } catch (error) {
    console.error("Error caching refresh token:", error);
  }
};

// Helper function for login notification
const sendLoginNotification = async (req, user) => {
  try {
    const clientIp =
      req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress;

    await notifyMe(
      `User ${user.username} logged into their Eureka account from IP: ${clientIp}`
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
    console.error("Error sending login notification:", error);
  }
};
// user logout handler
export const HandleUserLogout = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    if (!user_id || !req.user.username) {
      console.error(
        "User information not found at logout from jwt token",
        req.user
      );
      return res.status(401).send({ message: "Please log in to continue" });
    }

    const { error } = await supabase
      .from("Tokens")
      .delete("*")
      .eq("user_id", user_id);
    if (error) {
      console.error(error);
      return res
        .status(400)
        .send({ message: "Unable to log out of your account" });
    }
    const RefreshTokenKey = `user=${req.user.username}'s_userId=${user_id}`;
    await redisClient.del(RefreshTokenKey);
    res.clearCookie("Eureka_eta_six_version1_AuthToken");
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
      await notifyMe(
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
      .select("isVerified,username,email,id")
      .eq("email", email)
      .single();
    if (dbError) {
      await notifyMe(
        `An error occured while checking the verfication start of a user in the db`,
        dbError
      );
      return res.status(400).send({
        message: "Error while verifying you account , please try again later!",
      });
    }

    if (data.isVerified === true) {
      console.log(data.isVerified);
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
      await notifyMe(
        `account verification error ${JSON.stringify(error)} for user`,
        error
      );
      return res
        .status(400)
        .send({ message: "Error while verifying your account" });
    }

    // logg the user in for the first time automatically;
    const AuthToken = GenerateAccessTokens(data.id, data.email, data.username);

    if (!AuthToken) {
      return res.status(400).send({ message: "An error occurred" });
    }

    const RefreshToken = GenerateRefreshTokens(
      data.id,
      data.email,
      data.username
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
      await notifyMe(
        `Error while storing the tokens in the db for user= ${
          data.username
        } error message=${JSON.stringify(store.error)}`
      );
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
    // const welcomeEmail = await EmailServices.sendWelcomeEmail(user).catch(error => console.error('Register email failed ;', error));
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
      console.error(emailError);
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
    console.error(err);
    await notifyMe(
      `Error while sending the new verification Email to the user= ${JSON.stringify(
        err
      )}`
    );
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
const StoreTokens = async (RefreshToken, AuthToken, user_id, username) => {
  try {
    if (
      !RefreshToken ||
      !AuthToken ||
      !user_id ||
      typeof user_id !== "string" ||
      !username
    ) {
      console.log(
        RefreshToken,
        AuthToken,
        user_id,
        username,
        "Data has reached the store token function"
      );
      await notifyMe(`Some data is not available at the store token function`);
      return { error: "No token found" };
    }

    // Check if a token record already exists for this user
    const { data, error } = await supabase
      .from("Tokens")
      .select("user_id")
      .eq("user_id", user_id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error
      console.log(error, "Error from token check function");
      return { error: error };
    }

    // If the user_id is present in the database, update the tokens
    if (data?.user_id) {
      // Update existing token record
      const { error: updateError } = await supabase
        .from("Tokens")
        .update({ Access_Token: AuthToken, Refresh_Token: RefreshToken })
        .eq("user_id", user_id);

      if (updateError) {
        console.log("Token updation error", updateError);
        return { error: updateError };
      }
    } else {
      // Insert new token record
      const { error: insertError } = await supabase.from("Tokens").insert({
        Refresh_Token: RefreshToken,
        Access_Token: AuthToken,
        user_id: user_id,
      });

      if (insertError) {
        console.log("Token Insertion error", insertError);
        return { error: insertError };
      }
    }

    // Add both tokens to the cache - FIXED THIS LINE
    const RefreshTokenKey = `user=${username}'s_userId=${user_id}`;
    await redisClient.set(
      RefreshTokenKey,
      JSON.stringify(RefreshToken), // Use the RefreshToken parameter directly
      {
        expiration: {
          type: "EX",
          value: 800,
        },
      }
    );

    return { message: "Token stored successfully" };
  } catch (err) {
    await notifyMe("Error in store token function", err);
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
      .select("created_at,feedback,document_id,user_id,chunk_count,id")
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
      return res.status(401).json({ message: "Invalid user id" });
    }
    const username = req.user.username ? req.user.username : "unkown1";
    // unique userKye for caching
    const user_cache_key = `username=${username}&user_id=${user_id}`;

    // const userdata = await getUserDataFromCache(user_cache_key);
    const UserAccountDataKey = `user_id=${user_id}&username=${username}'s_dashboardData`;
    const userdata = await redisClient
      .hGetAll(UserAccountDataKey)
      .catch(
        async (err) =>
          await notifyMe(
            `${err} this error occured while checking for user dashboard data in the cache`
          )
      );

    // if there is cache info
    if (userdata) {
      const hasCachedData =
        userdata.userdata ||
        userdata.Contributions ||
        userdata.querycount ||
        userdata.Jrooms;
      userdata.notificationcount !== 0 ||
        userdata.notification ||
        userdata.feedbackcount;

      if (hasCachedData && !userdata.error) {
        // console.log("Serving from cache");
        return res.status(200).send({
          user: JSON.parse(userdata.userdata),
          Contributions_user_id_fkey: JSON.parse(userdata.Contributions),
          Querycount: JSON.parse(userdata.querycount),
          FeedbackCounts: JSON.parse(userdata.feedbackcount),
          chatrooms: JSON.parse(userdata.rooms),
          notificationcount: JSON.parse(userdata.notificationcount),
          notification: JSON.parse(userdata.notification),
          message: "User data found",
        });
      }
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
      return res.status(404).send({ message: "User not found" });
    }
    if (countData.error || votesData.error || chatroomsData.error) {
      return res.status(500).send({ message: "Error fetching user data" });
    }
    const StoreInCache = await StoreUserDataInTheCache(
      user_id,
      username,
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
      await notifyMe(
        `Error while storing ${req.user.username}'s data in the cache Error level critical`
      );
    }
    // Return the combined data
    return res.json({
      user: userData.data,
      Contributions_user_id_fkey: Contributions_user_id_fkey.data || [],
      Querycount: countData.count,
      FeedbackCounts:
        votesData?.data?.length > 0 ? votesData.data[0].Doc_Feedback : 0,
      chatrooms: chatroomsData.data,
      notificationcount: notificationcount.notificationcount,
      notifications: notifications.notifications,
      message: "User data found",
    });
  } catch (error) {
    await notifyMe(
      `An error ${error} From User account details function for user ${req.user.username}`
    );

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// store the user data in the cache
const StoreUserDataInTheCache = async (
  user_id,
  username,
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
    const UserAccountDataKey = `user_id=${user_id}&username=${username}'s_dashboardData`;
    // await redisClient.del(UserAccountDataKey);
    await redisClient
      .hSet(UserAccountDataKey, {
        ["userdata"]: JSON.stringify(userdata),
        ["Contributions"]: JSON.stringify(Contributions),
        ["querycount"]: JSON.stringify(querycount),
        ["feedbackcount"]: JSON.stringify(feedbackcount),
        ["rooms"]: JSON.stringify(rooms),
        ["notificationcount"]: JSON.stringify(notifycount),
        ["notification"]: JSON.stringify(notify),
      })
      .catch(
        async (err) =>
          await notifyMe(
            `Error ${err} while caching user dashboard information `
          )
      );
    await redisClient.expire(UserAccountDataKey, 50);
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
