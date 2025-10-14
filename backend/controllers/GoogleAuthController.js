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
    const user = await findOrCreateUser({ email, name, picture, googleId });

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
    res.cookie("Eureka_eta_six_version1_AuthToken", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 20 * 60 * 1000, // 20 minutes
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
  // Check if user exists
  const { data: existingUser, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (userError) {
    await notifyMe("User error in the google auth code flow", userError);
    return { error: "User not found" };
  }
  //   if the user previously loggedIn with google
  if (existingUser && existingUser.Google_Id) {
    const { error } = await supabase
      .from("users")
      .update({ Google_Id: googleId })
      .eq("id", existingUser.id);
    if (error) {
      await notifyMe("Error while updating the google id of a user", error);
    }
    return existingUser;
  } else if (existingUser && !existingUser.Google_Id) {
    return {
      error: "This account already exists , Please login with your password .",
    };
  }

  // Create new user
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
    .select()
    .single();

  if (createError) {
    throw new Error(`User creation failed: ${createError.message}`);
  }

  await notifyMe("A new user Logged In using google auth ", newUser);
  return newUser;
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
