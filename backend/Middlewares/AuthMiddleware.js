import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { supabase } from '../controllers/supabaseHandler.js';
import crypto from 'crypto';
dotenv.config();


const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

export const VerifyToken = async (req, res, next) => {
    try {
        // Get tokens from cookies
        const accessToken = req.cookies["Eureka_eta_six_version1_AuthToken"];
        const refreshToken = req.cookies["Eureka_eta_six_version1_RefreshToken"];

        // console.log(req.cookies);
        // console.log(JSON.parse(req.headers.authorization));
        // console.log('Tokens received - Access:', !!accessToken, 'Refresh:', !!refreshToken);

        if (!accessToken || !refreshToken) {
            console.log('Missing tokens');
            return res.status(401).json({ error: "Authentication required" });
        }

        // First try to verify access token
        try {
            const userData = jwt.verify(accessToken, process.env.JWT_SECRET);
            // console.log('Access token valid');
            req.user = userData;
            return next();
        } catch (accessTokenError) {
            // console.log('Access token error:', {
            //     name: accessTokenError.name,
            //     message: accessTokenError.message,
            //     expiredAt: accessTokenError.expiredAt
            // });

            // Handle only TokenExpiredError specifically
            if (accessTokenError.name !== 'TokenExpiredError') {
                // console.log('Non-expiration access token error');
                return res.status(403).json({ error: "Invalid access token" });
            }

            // console.log('Access token expired, proceeding with refresh token...');

            // Now verify refresh token
            let refreshData;
            try {
                refreshData = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                // console.log('Refresh token valid');
            } catch (refreshError) {
                console.log('Refresh token error:', {
                    name: refreshError.name,
                    message: refreshError.message,
                    expiredAt: refreshError.expiredAt
                });

                return res.status(403).json({
                    error: refreshError.name === 'TokenExpiredError'
                        ? "Session expired, please login again"
                        : "Invalid refresh token"
                });
            }

            // Verify token pair in database
            const hashedAccessToken = hashToken(accessToken);
            const hashedRefreshToken = hashToken(refreshToken);

            // console.log('Querying database for token pair...');
            const { data: tokenRecord, error: dbError } = await supabase
                .from("Tokens")
                .select("user_id , Access_Token , Refresh_Token").eq("user_id", jwt.decode(accessToken).id);


            if (dbError) {
                console.error('Database error:', dbError);
            }

            if (!tokenRecord) {
                // console.log('Token pair not found in database');
                return res.status(403).json({ error: "Invalid token pair" });
            }

            if (tokenRecord.user_id !== refreshData.user_id) {
                // console.log(`User ID mismatch: DB=${tokenRecord.user_id}, Token=${refreshData.user_id}`);
                return res.status(403).json({ error: "User ID mismatch" });
            }

            // Issue new tokens
            // console.log('Issuing new tokens...');
            const newAccessToken = jwt.sign(
                { user_id: refreshData.user_id },
                process.env.JWT_SECRET,
                { expiresIn: "15m" }
            );
            const newRefreshToken = jwt.sign(
                { user_id: refreshData.user_id },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: "7d" }
            );

            // Update database
            // console.log('Updating tokens in database...');
            const { error: updateError } = await supabase
                .from("Tokens")
                .update({
                    Access_Token: hashToken(newAccessToken),
                    Refresh_Token: hashToken(newRefreshToken),
                })
                .eq("user_id", refreshData.id);

            if (updateError) {
                console.error('Update error:', updateError);
                return res.status(500).json({ error: "Failed to update tokens" });
            }

            // Set new cookies
            // console.log('Setting new cookies...');
            res.cookie("Eureka_eta_six_version1_AuthToken", newAccessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000 // 15 minutes
            });
            res.cookie("Eureka_eta_six_version1_RefreshToken", newRefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            // console.log('Authentication successful with refreshed tokens');
            req.user = { user_id: refreshData.user_id };
            return next();
        }
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const UpdateUserLoginState = (req, res) => {
    try {
        const user = req.user;
        // console.log(user)
        if (!req.user) {
            return res.status(200).json({ message: "session ended" })
        } else {
            res.status(200).json({ message: "verified" })
        }
    } catch (error) {
        console.error(error)
    }
}