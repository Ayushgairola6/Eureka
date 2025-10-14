import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { supabase } from "../controllers/supabaseHandler.js";
import { GenerateAccessTokens } from "../controllers/AuthController.js";
import { redisClient } from "../CachingHandler/redisClient.js";
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
      req.cookies["Eureka_eta_six_version1_AuthToken"];
    const AuthTokenFromHeaders = req.headers?.authorization?.split(" ")[1];
    const AccessToken = AuthTokenFromCookies || AuthTokenFromHeaders;
    // console.log(AccessToken)

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
            // console.log(data, error)
            // console.log("No Refresh token in database");

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

        // console.log("refreshtoken data", refreshToken)

        let refreshDecoded;
        try {
          refreshDecoded = await verifyJwtAsync(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
          );
        } catch (refreshErr) {
          const hasCachedRefreshToken = await redisClient.get(RefreshTokenKey);
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
          refreshDecoded.username
        );

        // Update the access token in DB
        await supabase
          .from("Tokens")
          .update({ Access_Token: newAccessToken })
          .eq("Refresh_Token", refreshToken);

        // Set new access token as cookie
        res.cookie("Eureka_eta_six_version1_AuthToken", newAccessToken, {
          httpOnly: true,
          secure: true,
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
    req.cookies["Eureka_eta_six_version1_AuthToken"] || req.query?.AccessToken;

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
      await redisClient.set(refreshKey, JSON.stringify(refreshToken), {
        EX: 600,
      });
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
      refreshDecoded.username
    );

    // Update DB
    await supabase
      .from("Tokens")
      .update({ Access_Token: newAccessToken })
      .eq("Refresh_Token", refreshToken);

    // Send back as cookie for browser
    res.cookie("Eureka_eta_six_version1_AuthToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return { user: refreshDecoded, newAccessToken };
  }
}
