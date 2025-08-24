import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from './supabaseHandler.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

// nodemailer transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
        user: 'apikey', // Literally write 'apikey'
        pass: process.env.SENDGRID_API_KEY, // Replace with your API key
    },
});


export const HandleUserRegistration = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are mandatory" });
        }

        const { data, error } = await supabase.from("users").select().eq("email", email);
        if (error) {
            return res.status(400).json({ message: "Error while creating an account !" })
        }

        if (data.length > 0) {
            console.log(data);
            return res.status(400).json({ message: "User already Exists  ! Please Login instead" });
        }

        const HashedPassword = await bcrypt.hash(password, 8);

        if (!HashedPassword) {
            return res.status(400).json({ message: "Error while creating an account" });

        }

        const NewUserAccount = await supabase.from('users').insert({ username: username.trim(), email: email, password: HashedPassword })

        if (NewUserAccount.error) {
            return res.status(400).json({ message: "Erorr while creating an account !" });
        }

        const mailOptions = {
            from: 'your@verified-domain.com', // Must be verified in SendGrid
            to: 'user@example.com',
            subject: 'Email Verification',
            html: '<h1>Welcome to Eureka </h1><p>Click <a href="https://your-site.com/verify?token=abc123">here</a> to verify.</p>',
        };

        return res.json({ message: "Account created successfully !" })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error while creating an account !" })
    }
}

export const HandleUserLogin = async (req, res) => {
    try {
        // console.log(req.body)
        const { email, password } = req.body;

        if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
            console.error("Invalid data ")
            return res.status(400).json({ message: "Invalid data type !" })
        }

        const { data, error } = await supabase.from("users").select('email, id, username').eq('email', email)

        if (data?.length === 0 || error) {
            console.error(error, 'user not found');
            return res.status(404).json({ message: "User not found !" })
        }

        const RefreshToken = GenerateRefreshTokens(data[0].id, data[0].email, data[0].username);
        const AuthToken = GenerateAccessTokens(data[0].id, data[0].email, data[0].username)
        const store = await StoreTokens(RefreshToken, AuthToken, data[0].id);
        if (store.error) {
            console.log(store.error)
            return res.status(400).json({ message: "Error while logging in please try again later !" })
        }

        res.cookie('Eureka_eta_six_version1_AuthToken', AuthToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({ message: "Login successfull", AuthToken: AuthToken })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error while Logging into your account !" })
    }
}

// generate access token 
export const GenerateRefreshTokens = (id, email, username) => {
    try {
        if (!id || typeof id !== 'string' || !email || typeof email !== "string" || !username || typeof username !== 'string') {
            return { status: 400, error: "Error - Some arguments are missing !" }
        }
        const RefreshToken = jwt.sign({ user_id: id, email: email, username: username }, process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '30d' });


        return RefreshToken;
    } catch (err) {
        console.error(err);
    }
}

export const GenerateAccessTokens = (id, email, username) => {
    try {
        if (!id || typeof id !== 'string' || !email || typeof email !== "string" || !username || typeof username !== 'string') {
            return { status: 400, error: "Error - Some arguments are missing !" }
        }
        const Secret = process.env.JWT_SECRET;
        const AccessToken = jwt.sign({ user_id: id, email: email, username: username }, Secret,
            { expiresIn: '20min' });
        return AccessToken;
    } catch (err) {
        console.error(err)
    }
}

// Store tokens in the database;
const StoreTokens = async (RefreshToken, AuthToken, id) => {
    try {
        if (!RefreshToken || !AuthToken || !id || typeof id !== 'string') {
            return { error: "No token found" };
        }

        // Check if a token record already exists for this user
        const { data, error } = await supabase
            .from("Tokens")
            .select('user_id')
            .eq('user_id', id)
            .single();


        // if the user_id is present in the database 
        //update the authToken and refreshToken
        if (data?.user_id) {
            // Update existing token record
            const { error: updateError } = await supabase
                .from("Tokens")
                .update({ Access_Token: AuthToken, Refresh_Token: RefreshToken })
                .eq('user_id', id);
            if (updateError) {
                return { error: updateError };
            }
        } else {
            // Insert new token record
            const { error: insertError } = await supabase
                .from("Tokens")
                .insert({ Refresh_Token: RefreshToken, Access_Token: AuthToken, user_id: id });
            if (insertError) {
                return { error: insertError };
            }
        }

        return { message: "Token stored successfully" };
    } catch (err) {
        console.error(err);
        return { error: err };
    }
};
//get user account details

// Function to get user details
export const GetUserData = async (user_id) => {
    try {
        const { data, error } = await supabase
            .from("users")
            .select(`username, created_at, email, id`)
            .eq('id', user_id)
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
            .select("*")
            .eq("user_id", user_id).eq("Document_visibility", 'Private');

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
            .from('Conversation_History')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user_id);

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
            .select("created_at, chunk_count, Doc_Feedback(upvotes, downvotes, partial_upvotes)")
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

// Main function to get all user data
export const GetUserAccountDetails = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        if (!user_id || typeof user_id !== "string") {
            console.log("No user id found while getting account details");
            return res.status(400).json({ message: "Invalid user id" });
        }

        // Fetch all data in parallel to improve performance
        const [userData, countData, votesData, chatroomsData, Contributions_user_id_fkey] = await Promise.all([
            GetUserData(user_id),
            GetUserQuestionAskedCount(user_id),
            GetUserLikeCount(user_id),
            GetUserChatRooms(user_id),
            GetUserContributions(user_id),
        ]);

        // Consistent error handling
        if (userData.error) {
            console.error("Failed to fetch user data:", userData.error);
            return res.status(404).send({ message: "User not found" });
        }
        if (countData.error || votesData.error || chatroomsData.error) {
            console.error("Failed to fetch additional data:", countData.error, votesData.error, chatroomsData.error);
            return res.status(500).send({ message: "Error fetching user data" });
        }

        // Return the combined data
        return res.json({
            user: userData.data,
            Contributions_user_id_fkey: Contributions_user_id_fkey.data,
            Querycount: countData.count,
            FeedbackCounts: votesData?.data?.length > 0 ? votesData.data[0].Doc_Feedback : null,
            chatrooms: chatroomsData.data,
            message: "User data found"
        });

    } catch (error) {
        console.error("Server exception:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};