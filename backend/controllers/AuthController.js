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

        const { data, error } = await supabase.from("users").select();
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

export const GetUserAccountDetails = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        // Get the basic user information
        if (!user_id || typeof user_id !== "string") {
            console.log("No user id found ,whie getting account details")
            return res.status(400).json({ message: "Invalid user id" });
        }
        const { data, error } = await supabase
            .from('users')
            .select('username,created_at,email, id, Contributions_user_id_fkey(*)').eq('id', user_id, 'visibility', 'Private').single()

        // get the queryCount
        const { count, error: countError } = await supabase
            .from('Conversation_History')
            .select('question', { count: 'exact' })
            .eq('user_id', user_id);

        if (error || countError) {
            console.log(error ? error : countError)
            return res.status(404).json({ user: null, message: "User not found" });
        }

        // Like count on the users Public knowledgebase contribution
        const { data: uservotes, error: uservoteerror } = await supabase
            .from("Contributions").select("created_at , chunk_count ,Doc_Feedback(upvotes,downvotes,partial_upvotes)").eq("user_id", user_id).eq("Document_visibility", "Public");


        if (uservoteerror) {
            console.log(uservoteerror);
            return res.status(404).json({ user: null, message: "User not found" });
        }

        return res.json({ user: data, Querycount: count, FeedbackCounts: uservotes[0].Doc_Feedback, message: "User data found" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }

}