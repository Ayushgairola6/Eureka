import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
import {
  GenerateAccessTokens,
  GenerateRefreshTokens,
  StoreTokens,
} from "./AuthController.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import { supabase } from "./supabaseHandler.js";
import { EmailServices } from "../EmailHandlers/EmailTemplates.js";
dotenv.config();

const GOOGLE_REDIRECT_URI = `${process.env.SERVER_URL}/api/auth/google/callback`;

const pendingStates = new Map();

export const InitiateGoogleAuth = async (req, res) => {
  try {
    const rootURl = `https://accounts.google.com/o/oauth2/v2/auth`;

    //   generating anti csrf state parameter
    const state = crypto.randomBytes(32).toString("hex");
    // storing in the map
    pendingStates.set(state, { timestamp: Date.now() });
    // emptying the map
    cleanupOldStates();

    const options = {
      client_id: process.env.GOOGLE_AUTH_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: "code",
      access_type: "offline", // Important for refresh tokens
      prompt: "consent", // Force consent screen to get refresh token
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
      state: state,
    };

    const qs = new URLSearchParams(options);
    const AuthUrl = `${rootURl}?${qs.toString()}`;

    return res.redirect(AuthUrl);
  } catch (googleAuthError) {
    await notifyMe(`Google auth initiation error: ${error.message}`);
    return res.redirect(
      `${process.env.CLIENT_URL}/client/OAuthCallback?error=oauth_init_failed`
    );
  }
};

export const HandleGoogleCallback = async (req, res) => {
  try {
    const { code, state, error } = req.query;
    if (error) {
      await notifyMe(
        "something went wrong in the googl auth callback function",
        error
      );
      return res.redirect(
        `${process.env.CLIENT_URL}/client/OAuthCallback?error=google_auth_failed`
      );
    }
    if (!code || !state) {
      return res.redirect(
        `${process.env.CLIENT_URL}/client/OAuthCallback?error=invalid_callback`
      );
    }

    // verifying the anti csrf state
    if (!pendingStates.has(state)) {
      return res.redirect(
        `${process.env.CLIENT_URL}/client/OAuthCallback?error=security_timeout`
      );
    }
    pendingStates.delete(state); //remove from map
    // exchanging code for tokens
    const tokenResponse = await exchangeCodeForTokens(code);

    if (tokenResponse?.error) {
      return res.redirect(
        `${process.env.CLIENT_URL}/client/OAuthCallback?error=token_exchange_failed`
      );
    }

    const { access_token } = tokenResponse.data;
    // 4. Get user profile from Google
    const userProfile = await getUserProfile(access_token);

    const { email, name, picture, sub: googleId } = userProfile;

    // 5. Find or create user in database
    const user = await findOrCreateUser({
      email,
      name,
      picture,
      googleId,
    });

    if (user?.error) {
      const errorrMessage = encodeURIComponent(user.error);
      return res.redirect(
        `${
          process.env.CLIENT_URL
        }/client/OAuthCallback?error=${encodeURIComponent(user.error)}`
      );
    }
    // 6. Generate application tokens (using your existing functions)

    const AllowedTrainingModels = user.AllowedTrainingModels || "YES";
    const refreshToken = GenerateRefreshTokens(
      user.id,
      user.email,
      user.username,
      AllowedTrainingModels
    );
    // generate new sesstion token
    const authToken = GenerateAccessTokens(
      user.id,
      user.email,
      user.username,
      AllowedTrainingModels
    );

    if (!authToken || !refreshToken) {
      return res.redirect(
        `${process.env.CLIENT_URL}/client/OAuthCallback?error=system_token_error`
      );
    }

    // 7. Store tokens in database (your existing function)
    const storeResult = await StoreTokens(
      refreshToken,
      authToken,
      user.id,
      user.username
    );
    if (storeResult.error) {
      await notifyMe(
        "Error while storing tokens in google auth controller",
        storeResult.error
      );
    }

    const { error: dbError } = await supabase
      .from("Payments")
      .upsert(
        { user_id: user.id, plan_type: "free", plan_status: "active" },
        { onConflict: "user_id" }
      );
    if (dbError) {
      await notifyMe(
        "The googleAuthController failed while inserting the payment status into the database",
        error
      );
    }
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("AntiNode_eta_six_version1_AuthToken", authToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      ...(isProduction && { domain: ".antinodeai.space" }),
      maxAge: 24 * 60 * 60 * 1000,
    });

    notifyMe(`User ${user.username} logged in via Google OAuth`);

    EmailServices.sendLoginNotification(user, {
      ip: clientIp,
      userAgent: req.headers["user-agent"],
      browser: req.headers["sec-ch-ua"],
      platform: req.headers["sec-ch-ua"],
      timestamp: new Date(),
    });
    return res.redirect(
      `${process.env.CLIENT_URL}/client/OAuthCallback?auth=success&message=Identity_Verified`
    );
  } catch (error) {
    notifyMe("Something went wrong in the google auth controller", error);
    return res.redirect(
      `${process.env.CLIENT_URL}/client/OAuthCallback?error=internal_server_error`
    );
  }
};

// getting the user data based on the code recieved
async function exchangeCodeForTokens(code) {
  try {
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const tokenData = {
      code,
      client_id: process.env.GOOGLE_AUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    };
    const requestResult = await axios.post(
      tokenUrl,
      new URLSearchParams(tokenData),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return requestResult;
  } catch (error) {
    return { error };
  }
}

// Helper function: Get user profile from Google
async function getUserProfile(access_token) {
  const userInfoResponse = await axios.get(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return userInfoResponse.data;
}

// Helper function: Find or create user in database
async function findOrCreateUser(googleUser) {
  const { email, name, picture, googleId } = googleUser;
  const emailLower = email.toLowerCase();

  // --- 1. Check if user exists ---
  const { data: existingUser, error: selectError } = await supabase
    .from("users")
    .select("*")
    .eq("email", emailLower)
    .single();

  if (selectError && !existingUser) {
    // FIX: Correct logic for checking error code
    // PGRST116 is the code for "Row not found" (which is expected for new users)
    if (selectError.code !== "PGRST116") {
      await notifyMe("Critical DB Error during user selection", selectError);
      return { error: "Database error during login check." };
    }
  }

  // --- 2. Scenario: New User ---
  if (!existingUser) {
    const newUser = await createNewUser(name, emailLower, googleId);

    if (!newUser || newUser.error) {
      await notifyMe(
        "Error while creating a new user",
        newUser?.error || "Unknown"
      );
      return { message: "Unable to create a new user." };
    }
    await notifyMe("A new user Logged In using Google Auth", newUser);
    return newUser;
  }

  // --- 3. Scenario: Existing User Logic ---

  // Case A: User exists but no Google ID (Password user)
  if (!existingUser.Google_Id) {
    // Optional: Auto-link account here if you want to support it
    return {
      error:
        "This account already exists. Please login with your password first to link the account.",
    };
  }

  // Case B: Google ID Mismatch
  if (existingUser.Google_Id !== googleId) {
    await notifyMe(
      `GoogleId mismatch for ${email}. DB:${existingUser.Google_Id}, New:${googleId}`
    );
    // FIX: Added missing closing brace below
  }

  return existingUser;
}

// Helper function: Clean up old states
function cleanupOldStates() {
  const now = Date.now();
  const tenMinutesAgo = now - 10 * 60 * 1000;

  for (const [state, data] of pendingStates.entries()) {
    if (data.timestamp < tenMinutesAgo) {
      pendingStates.delete(state);
    }
  }
}

async function createNewUser(name, email, googleId) {
  const username = name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();

  const { data: newUser, error: createError } = await supabase
    .from("users")
    .insert({
      email: email.toLowerCase(),
      username: username,
      Google_Id: googleId,
      isVerified: true,
      password: null,
      IsPremiumUser: false,
      AllowedTrainingModels: true,
    })
    .select("*")
    .single();

  if (createError) {
    return { error: "Error while creating a new user" };
  }

  return newUser;
}
