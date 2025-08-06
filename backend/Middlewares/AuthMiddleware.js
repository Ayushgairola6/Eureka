import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { supabase } from '../controllers/supabaseHandler.js';
import { GenerateAccessTokens } from '../controllers/AuthController.js';
dotenv.config();

const verifyJwtAsync = (token, secret) =>
    new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) return reject(err);
            resolve(decoded);
        });
    });

export const VerifyToken = async (req, res, next) => {
    try {
        const AuthTokenFromCookies = req.cookies["Eureka_eta_six_version1_AuthToken"];
        const AuthTokenFromHeaders = req.headers?.authorization?.split(" ")[1];
        const AccessToken = AuthTokenFromCookies || AuthTokenFromHeaders;
        // console.log(AccessToken)
        if (!AccessToken) {
            // console.log("No access token")
            return res.status(401).json({ message: "No session token found" });
        }

        try {
            // Try to verify access token
            const decoded = await verifyJwtAsync(AccessToken, process.env.JWT_SECRET);
            // console.log("user found")

            req.user = decoded;
            return next();
        } catch (err) {
            // If access token expired, try refresh flow
            if (err.name === "TokenExpiredError") {
                // console.log("Access token expired",AccessToken)

                // Find refresh token in DB where Access_Token matches
                // console.log("Validating refreshToken")
          
                const { data, error } = await supabase
                    .from("Tokens")
                    .select("Refresh_Token, user_id").eq('Access_Token',AccessToken)
                    
                   
            //   console.log(data,'Token data from the database')
                if (error || !data) {
                    console.log(data,error)
                    console.log("No Refresh token in database")

                    return res.status(401).json({ message: "Session expired. Please log in again." });
                }

                const refreshToken = data[0]?.Refresh_Token;
                // console.log(refreshToken)
                let refreshDecoded;
                try {
                    // console.log("Verifying refresh TOken")

                    refreshDecoded = await verifyJwtAsync(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                } catch (refreshErr) {
                    // console.log(refreshErr)
                    return res.status(401).json({ message: "Session expired. Please log in again." });
                }
                // console.log("Assigning new access token because the refreshToken is still valid")

                // If refresh token is valid, issue new access token
                const newAccessToken = GenerateAccessTokens(
                    refreshDecoded.user_id,
                    refreshDecoded.email,
                    refreshDecoded.username
                );

                // Update the access token in DB
                // console.log("Updating the access token in the databse")

                await supabase
                    .from("Tokens")
                    .update({ Access_Token: newAccessToken })
                    .eq("Refresh_Token", refreshToken);

                // Set new access token as cookie
                res.cookie('Eureka_eta_six_version1_AuthToken', newAccessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: 24 * 60 * 60 * 1000,
                });

                req.user = refreshDecoded;
                // Optionally, you can attach a flag to let the client know a new token was issued
                res.set('X-New-Access-Token', 'true');
                return next();
            }
            // Other errors (malformed, invalid, etc.)
            return res.status(403).json({ message: "Invalid or malformed token." });
        }
    } catch (error) {
        console.error("Authentication error:", error);
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
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};