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
dotenv.config();
// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
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
        `${process.env.CLIENT_URL}/client/OAuthCallback?error=google_denied`
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
        `${process.env.CLIENT_URL}/client/OAuthCallback?error=security_violation`
      );
    }
    pendingStates.delete(state); //remove from map
    // exchanging code for tokens
    const tokenResponse = await exchangeCodeForTokens(code);

    if (tokenResponse?.error) {
      return res.redirect(
        `${process.env.CLIENT_URL}/client/OAuthCallback?error=Something went wrong`
      );
    }

    const { access_token, id_token } = tokenResponse.data;
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
      return res.redirect(
        `${process.env.CLIENT_URL}/client/OAuthCallback?error=${user.error}`
      );
    }
    // 6. Generate application tokens (using your existing functions)
    const refreshToken = GenerateRefreshTokens(
      user.id,
      user.email,
      user.username
    );
    // generate new sesstion token
    const authToken = GenerateAccessTokens(user.id, user.email, user.username);

    if (!refreshToken || !authToken) {
      throw new Error("Token generation failed");
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

    // 8. Set authentication cookie
    res.cookie("AntiNode_eta_six_version1_AuthToken", authToken, {
      httpOnly: true,
  secure: true, // Required for sameSite: "none"
  sameSite: "none", // Allows the cookie to survive the jump from api. to www.
  domain: ".antinodeai.space", // The leading dot is the "Subdomain Unlock"
  maxAge: 24 * 60 * 60 * 1000,
    });

    // 9. Send notification
    await notifyMe(`User ${user.username} logged in via Google OAuth`);

    // 10. Redirect to frontend with success
    return res.redirect(
      `${process.env.CLIENT_URL}/Interface?SessionId=${authToken}`
    );
  } catch (error) {
    await notifyMe("Something went wrong in the google auth controller", error);
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
    // If the error is NOT 'no rows found' (i.e., a real DB error), stop.
    // Supabase sets data to null and error to non-null on 0 rows,
    // but the error object is often large, so this is a safety check.
    if (!selectError.details.includes("0 rows")) {
      await notifyMe("Critical DB Error during user selection", selectError);
      return { error: "Database error during login check." };
    }
  }

  // --- 2. Scenario: New User (ExistingUser is null) ---
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

  // Case A: User existed, but signed up with email/password (no Google ID).
  if (!existingUser.Google_Id) {
    // SECURITY CHOICE: If you want to allow them to link their account:
    // This is where you would update their Google_Id with the new value.
    // If you want to BLOCK them (your original intention):
    return {
      error:
        "This account already exists. Please login with your password first to link the account.",
    };
  }

  // Case B: User already signed up via Google, but maybe the ID changed (rare) or you want to update the ID.
  if (existingUser.Google_Id !== googleId) {
    const { error: updateError } = await supabase
      .from("users")
      .update({ Google_Id: googleId })
      .eq("id", existingUser.id);

    if (updateError) {
      await notifyMe(
        "Error while updating the Google ID of an existing user",
        updateError
      );
    }
  }

  // Return the existing (potentially updated) user object
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
    })
    .select("*")
    .single();

  if (createError) {
    return { error: "Error while creating a new user" };
  }

  return newUser;
}
