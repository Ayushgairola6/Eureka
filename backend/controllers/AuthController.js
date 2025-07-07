import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from './supabaseHandler.js';
import dotenv from 'dotenv';
dotenv.config();



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