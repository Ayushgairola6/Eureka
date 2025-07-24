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
            return res.status(400).json({ message: "Invalid data type !" })
        }

        const { data, error } = await supabase.from("users").select('email, id, username').eq('email', email)

        if (data?.length === 0 || error) {
            console.error(error);
            return res.status(404).json({ message: "User not found !" })
        }

        const AuthToken = jwt.sign(
            {
                id: data[0].id,
                email: data[0].email,
                username: data[0].username
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // attaching cookies to the response
        res.cookie('Eureka_eta_six_version1_Auth_Token', AuthToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({ message: "Login successfull", token: AuthToken })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error while Logging into your account !" })
    }
}

//get user account details

export const GetUserAccountDetails = async (req, res) => {
    try {
        const user_id = req.user.id;
        if (!user_id || typeof user_id !== "string") {
            return res.status(400).json({ message: "Invalid user id" });
        }

        const { data, error } = await supabase.from("users").select("username , email,id");
        if (error) {
            console.log(error)
            return res.status(404).json({ user:null,message: "User not found" });
        }

        return res.json({user:data,message:"User data found"});
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }

}