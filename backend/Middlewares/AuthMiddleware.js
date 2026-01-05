import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { supabase } from "../controllers/supabaseHandler.js";
import { GenerateAccessTokens } from "../controllers/AuthController.js";
import { redisClient } from "../CachingHandler/redisClient.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
dotenv.config();

export const verifyJwtAsync = (token, secret) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });

export const VerifyToken = async (req, res, next) => {
  try {
    const AuthTokenFromCookies =
      req.cookies["AntiNode_eta_six_version1_AuthToken"];
    const AuthTokenFromHeaders = req.headers?.authorization?.split(" ")[1];
    const AccessToken = AuthTokenFromCookies || AuthTokenFromHeaders;

    if (!AccessToken) {
      // console.log("No access token")
      return res.status(401).json({ message: "No session token found" });
    }

    try {
      // console.log("Verifying access token")
      // Try to verify access token
      const decoded = await verifyJwtAsync(AccessToken, process.env.JWT_SECRET);
      // console.log("user found")

      req.user = decoded;
      return next();
    } catch (err) {
      // If access token expired, try refresh flow
      if (err.name === "TokenExpiredError") {
        // console.log("Access token expired")
        const DecodedData = jwt.decode(AccessToken);
        const RefreshTokenKey = `user=${DecodedData.username}'s_userId=${DecodedData.user_id}`;

        // checking refresh token in the cache
        const HasCacheRefreshToken = await redisClient.get(RefreshTokenKey);
        let refreshToken;

        if (HasCacheRefreshToken) {
          refreshToken = JSON.parse(HasCacheRefreshToken);
        } else {
          const { data, error } = await supabase
            .from("Tokens")
            .select("Refresh_Token")
            .eq(" user_id", DecodedData?.user_id);

          if (error || !data) {
            return res
              .status(401)
              .json({ message: "Session expired. Please log in again." });
          }
          refreshToken = data[0].Refresh_Token;
          // store the token in the cache
          await redisClient.set(
            RefreshTokenKey,
            JSON.stringify(data[0].Refresh_Token),
            {
              expiration: {
                type: "EX",
                value: 800,
              },
            }
          );
        }

        let refreshDecoded;
        try {
          refreshDecoded = await verifyJwtAsync(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
          );
        } catch (refreshErr) {
          const hasCachedRefreshToken = await redisClient.exists(
            RefreshTokenKey
          );
          if (hasCachedRefreshToken) {
            await redisClient.del(RefreshTokenKey);
          }
          return res
            .status(401)
            .json({ message: "Session expired. Please log in again." });
        }

        // If refresh token is valid, issue new access token
        const newAccessToken = GenerateAccessTokens(
          refreshDecoded.user_id,
          refreshDecoded.email,
          refreshDecoded.username,
          refreshDecoded.PaymentStatus,
          refreshDecoded.AllowedTrainingModels
        );

        // Update the access token in DB
        await supabase
          .from("Tokens")
          .update({ Access_Token: newAccessToken })
          .eq("Refresh_Token", refreshToken);

        // Set new access token as cookie
        res.cookie("AntiNode_eta_six_version1_AuthToken", newAccessToken, {
          httpOnly: true,
          secure: true,
          domain:".antinodeai.space"
          sameSite: "none",
          maxAge: 24 * 60 * 60 * 1000,
        });

        req.user = refreshDecoded;
        res.set("X-New-Access-Token", "true");
        return next();
      }
      return res.status(403).json({ message: "Invalid or malformed token." });
    }
  } catch (error) {
    // console.error(error);
    await notifyMe("An error occured in the authMiddleware", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const UpdateUserLoginState = (req, res) => {
  try {
    if (!req.user) {
      return res.status(200).json({ message: "session ended" });
    } else {
      return res.status(200).json({ message: "verified" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export async function authenticateStream(req, res) {
  const accessToken =
    req.cookies["AntiNode_eta_six_version1_AuthToken"] ||
    req.query?.AccessToken;

  if (!accessToken) {
    throw { status: 401, message: "No session token found" };
  }

  try {
    const decoded = await verifyJwtAsync(accessToken, process.env.JWT_SECRET);
    return { user: decoded, newAccessToken: null };
  } catch (err) {
    if (err.name !== "TokenExpiredError") {
      throw { status: 403, message: "Invalid or malformed token." };
    }

    // Token expired → try refresh
    const decodedData = jwt.decode(accessToken);
    const refreshKey = `user=${decodedData.username}'s_userId=${decodedData.user_id}`;

    let refreshToken;

    // First check cache
    const cached = await redisClient.get(refreshKey);
    if (cached) {
      refreshToken = JSON.parse(cached);
    } else {
      const { data, error } = await supabase
        .from("Tokens")
        .select("Refresh_Token")
        .eq("user_id", decodedData.user_id)
        .single();

      if (error || !data) {
        throw { status: 401, message: "Session expired. Please log in again." };
      }

      refreshToken = data.Refresh_Token;

      // Cache it for 10 min
      await redisClient.multi().set(refreshKey, JSON.stringify(refreshToken)).expire(refreshKey,1000);
    }

    let refreshDecoded;
    try {
      refreshDecoded = await verifyJwtAsync(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch {
      await redisClient.del(refreshKey);
      throw { status: 401, message: "Session expired. Please log in again." };
    }

    // Generate new access token
    const newAccessToken = GenerateAccessTokens(
      refreshDecoded.user_id,
      refreshDecoded.email,
      refreshDecoded.username,
      refreshDecoded.PaymentStatus,refreshDecoded.AllowedTrainingModels
    );

    // Update DB
    await supabase
      .from("Tokens")
      .update({ Access_Token: newAccessToken })
      .eq("Refresh_Token", refreshToken);

    // Send back as cookie for browser
    res.cookie("AntiNode_eta_six_version1_AuthToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      domain:".antinodeai.space",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return { user: refreshDecoded, newAccessToken };
  }
}

export async function HandlePreferenceToggle(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).send({ message: "Please login to continue" });
    }
    const { value } = req.body;
    if (!value) {
      return res.status(404).send({
        message: "No value found",
        pref: value === "YES" ? "NO" : "YES",
      });
    }
    const UserAccountDataKey = `user_id=${user.user_id}'s_dashboardData`;

    const cacheExists = await redisClient.exists(UserAccountDataKey);
    const userInfo = await redisClient.hGet(UserAccountDataKey, "userdata");

    const parsedInfo = JSON.parse(userInfo);
    // console.log(parsedInfo);
    // if both the old and new values match do nothing
    if (parsedInfo && parsedInfo.AllowedTrainingModels === value) {
      return res.status(200).send({ message: "updated", pref: value });
    }
    //if cache exists
    if (cacheExists) {
      //update the db
      const { error } = await supabase
        .from("users")
        .update({ AllowedTrainingModels: value })
        .eq("id", user.user_id);

      if (error) {
        // console.log(error);
        return res.status(400).send({
          message: "An error occured while performing update",
          pref: value === "YES" ? "NO" : "YES",
        });
      }

      // update the cache as well
      const parsedInfo = JSON.parse(userInfo);
      // console.log(parsedInfo);
      const NewInfo = {
        ...parsedInfo,
        AllowedTrainingModels: value,
      };

      await redisClient
        .hSet(UserAccountDataKey, "userdata", JSON.stringify(NewInfo))
        .catch((error) => {
          console.error(error);
        });
    } else {
      //else only update the db
      const { error } = await supabase
        .from("users")
        .update({ AllowedTrainingModels: value })
        .eq("id", user.user_id);
      if (error) {
        // console.log(error);
        return res.status(400).send({
          message: "An error occured while performing update",
          pref: value === "YES" ? "NO" : "YES",
        });
      }
    }
    return res.status(200).send({ message: "updated", pref: value });
  } catch (error) {
    console.error(error);

    await notifyMe("Error while toggling the preference", error);
  }
}
