import { redisClient } from "../CachingHandler/redisClient.js";
import { supabase } from "../controllers/supabaseHandler.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import crypto from "crypto";
import axios from "axios";

const DRIVE_REDIRECT_URI = `${process.env.SERVER_URL}/api/auth/google/drive/callback`;

const pendingStates = new Map();

function cleanupOldStates() {
  const now = Date.now();
  const tenMinutesAgo = now - 10 * 60 * 1000;
  for (const [state, data] of pendingStates.entries()) {
    if (data.timestamp < tenMinutesAgo) pendingStates.delete(state);
  }
}

// ── Status check ──────────────────────────────────────────────────────────────
export const StatusCheckDriveConnector = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.user_id)
      return res.status(401).json({ message: "Please login to continue" });

    const key = `user:${user.user_id}:connectors`;

    // check cache
    const cached = await redisClient.get(key);
    if (cached) {
      const connectors = JSON.parse(cached);
      const isDriveConnected = connectors.includes("google_drive");
      return res.status(200).json({
        message: isDriveConnected
          ? "Drive is connected"
          : "Drive is not connected",
        action: isDriveConnected ? "drive_connected" : "drive_not_connected",
      });
    }

    // cache miss — check DB
    const { data, error } = await supabase
      .from("user_integrations")
      .select("provider")
      .eq("user_id", user.user_id);

    if (error) {
      notifyMe("Error checking drive status from DB", error);
      return res.status(500).json({ message: "Something went wrong" });
    }

    const connectors = data?.map((row) => row.provider) || [];
    const isDriveConnected = connectors.includes("google_drive");

    // cache the actual connector list with expiry
    await redisClient.set(key, JSON.stringify(connectors), { EX: 60 * 60 }); // 1hr

    return res.status(200).json({
      message: isDriveConnected
        ? "Drive is connected"
        : "Drive is not connected",
      action: isDriveConnected ? "drive_connected" : "drive_not_connected",
    });
  } catch (error) {
    notifyMe("Error checking drive connector status", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ── Initiate Drive connect ────────────────────────────────────────────────────
export const DriveConnector = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.user_id)
      return res.redirect(
        `${process.env.CLIENT_URL}/client/Drive_Auth?error=Please login to continue`
      );

    const state = crypto.randomBytes(32).toString("hex");

    pendingStates.set(state, {
      timestamp: Date.now(),
      user_id: user.user_id,
      purpose: "drive_connect",
    });

    cleanupOldStates();

    const options = {
      client_id: process.env.GOOGLE_AUTH_CLIENT_ID,
      redirect_uri: DRIVE_REDIRECT_URI,
      response_type: "code",
      access_type: "offline",
      prompt: "consent", // always force to guarantee refresh_token
      scope: "https://www.googleapis.com/auth/drive.readonly",
      state,
    };

    const qs = new URLSearchParams(options);
    return res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${qs.toString()}`
    );
  } catch (error) {
    notifyMe("Error initiating drive connector", error);
    return res.redirect(
      `${process.env.CLIENT_URL}/client/Drive_Auth?error=Something went wrong`
    );
  }
};

// ── Handle Drive OAuth callback ───────────────────────────────────────────────
export const HandleDriveCallback = async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${process.env.CLIENT_URL}/interface?drive=denied`);
    }

    if (!code || !state || !pendingStates.has(state)) {
      return res.redirect(`${process.env.CLIENT_URL}/interface?drive=invalid`);
    }

    const stateData = pendingStates.get(state);
    pendingStates.delete(state);

    if (stateData.purpose !== "drive_connect") {
      return res.redirect(`${process.env.CLIENT_URL}/interface?drive=invalid`);
    }

    const { user_id } = stateData;

    // exchange code for tokens
    const tokenResponse = await axios
      .post(
        "https://oauth2.googleapis.com/token",
        new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_AUTH_CLIENT_ID,
          client_secret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
          redirect_uri: DRIVE_REDIRECT_URI,
          grant_type: "authorization_code",
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      )
      .catch((err) => ({ error: err }));

    if (tokenResponse?.error) {
      notifyMe("Drive token exchange failed", tokenResponse.error);
      return res.redirect(
        `${process.env.CLIENT_URL}/interface?drive=token_failed`
      );
    }

    const { access_token, refresh_token } = tokenResponse.data;

    if (!refresh_token) {
      // user may have already connected before — rare with prompt=consent
      return res.redirect(
        `${process.env.CLIENT_URL}/interface?drive=no_refresh_token`
      );
    }

    // upsert tokens — no pre-check needed, onConflict handles both cases
    const { error: upsertError } = await supabase
      .from("user_integrations")
      .upsert(
        {
          user_id,
          provider: "google_drive",
          access_token,
          refresh_token,
          expiry_date: Date.now() + 3600 * 1000,
        },
        {
          onConflict: "user_id, provider",
        }
      );

    if (upsertError) {
      notifyMe("Failed to store Drive tokens", upsertError);
      return res.redirect(
        `${process.env.CLIENT_URL}/interface?drive=storage_failed`
      );
    }

    // invalidate connector cache — force fresh status check next time
    const cacheKey = `user:${user_id}:connectors`;
    await redisClient.del(cacheKey);

    notifyMe(`User ${user_id} connected Google Drive`);

    return res.redirect(`${process.env.CLIENT_URL}/interface?drive=connected`);
  } catch (error) {
    notifyMe("Drive callback error", error);
    return res.redirect(`${process.env.CLIENT_URL}/interface?drive=error`);
  }
};
