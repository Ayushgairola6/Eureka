import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { motion } from 'framer-motion'
import { Link, useNavigate } from "react-router";
import axios, { isAxiosError } from 'axios'
import { toast, Toaster } from "sonner";
import {FaUserPlus,FaUser} from 'react-icons/fa'
import { MdEmail ,MdPassword } from "react-icons/md";

import { IoIosHourglass } from "react-icons/io";
const Register = () => {
    const navigate = useNavigate()
    const [Strength, setStrength] = useState(0)
    const Username = useRef<HTMLInputElement>(null);
    const Email = useRef<HTMLInputElement>(null);
    const Password = useRef<HTMLInputElement>(null);

    const [isPending, setIsPending] = useState("idle")

    useEffect(() => {
        if (isPending === 'success') {
            navigate("/Login")
        }
    }, [isPending])
    const ReflectPasswordStrength = (e: ChangeEvent<HTMLInputElement>) => {
        // console.log(e.target.value)
        if (e.target.value.trim().split("").length > 0) {
            setStrength((prev) => prev + 1);
        } else if (e.target.value.trim().split("").length = 0) {
            setStrength(0)
        }
    }

    const HandleRegister = async () => {
        setIsPending('pending');
        if (!Username.current?.value ||
            !Email.current?.value ||
            !Password.current?.value) {
            setIsPending('idle');

            toast("All fields are Mandatory !")
            return;
        }

        const UserInformation = {
            username: Username.current.value.trim(),
            email: Email.current.value,
            password: Password.current.value
        }

        try {
            const response = await axios.post("http://localhost:1000/api/user/register", UserInformation, {
                withCredentials: true,
                headers: {
                    "Authorization": `Bearer ${"token"}`
                }
            })

            console.log(response)
            if (response.data.message === "Account created successfully !") {
                toast("Account Created Successfully !");
                setIsPending("success")
                setTimeout(() => {
                    setIsPending("idle")
                }, 3000)
            }
        } catch (error: unknown) {
            setIsPending('failed');

            if (isAxiosError(error)) {
                if (error.response?.data?.message === "User already Exists  ! Please Login instead") {
                    toast("User already Exists  ! Please Login instead");
                } else {
                    toast("Error while creating your Account !");
                }
            } else if (error instanceof Error) {
                toast(`Unexpected error: ${error.message}`);
            } else {
                toast("An unknown error occurred");
            }

            setTimeout(() => {
                setIsPending("idle");
            }, 3000);
        }
    }

    return (<>
        <div className="h-screen flex items-center justify-center relative z-[2]">
            {/* gradient accent background */}
            <div className="absolute h-full w-full top-0 left-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 blur-2xl z-[-1]"></div>

            <motion.div drag whileDrag={{ scale: 0.9 }} dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }} className="bg-gradient-to-br from-gray-100 to-gray-200 grid grid-cols-1  py-6 px-4 rounded-lg gap-4 w-4/5 md:w-1/3 lg:w-1/3 shadow-sm shadow-black curso-grab relative">
                <h1 className="text-center space-grotesk font-bold  text-2xl">Welcome to Eureka ! </h1>
                <span className="text-xs text-gray-700 space-grotesk text-center">Start contributing today and become a part of our community .</span>
                <span className="flex flex-col gap-2">
                    <label className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2" htmlFor="username"> <FaUser/>Username </label>
                    <input ref={Username} className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk" type="text" placeholder="Your full name" />
                </span>
                <span className="flex flex-col gap-2">
                    <label className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2" htmlFor="email"><MdEmail/>Email Address </label>
                    <input ref={Email} className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk" type="text" placeholder="Your email address" />
                </span>
                <span className="flex flex-col gap-2">
                    <label className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2" htmlFor="username"><MdPassword/> Password </label>
                    <input ref={Password} spellCheck onChange={(e) => ReflectPasswordStrength(e)} className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk" type="text" placeholder="Choose a strong password" />
                    <ul className={` text-xs rounded-full h-1  ${Strength > 0 ? "bg-red-600 w-1/4" : "bg-transparent"}`}></ul>
                </span>
                <span className="flex items-center justify-center py-4">
                    {isPending === 'idle' ? <motion.button whileHover={{boxShadow:"2px 2px 2px black",transform:"translateY(-3px)"}} onClick={HandleRegister} whileTap={{ scale: 0.9, boxShadow: "2px 2px 2px blue" }} transition={{ duration: 0.2 }} className="bg-black py-2 px-3 rounded-lg space-grotesk text-white w-full CustPoint flex items-center justify-center gap-2">Create Account <FaUserPlus/></motion.button> : <motion.div className="w-full bg-gray-800 space-grotesk border border-gray-600 text-white animate-pulse rounded-lg text-center py-2 px-3 flex items-center justify-center gap-2" >Setting up your Account <IoIosHourglass className="animate-spin"/></motion.div>}
                </span>
                <ul className="space-grotesk  text-sm text-center ">Have an Account ?<Link className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 font-semibold" to="/Login"> Login</Link></ul>

            </motion.div>
            <Toaster />
        </div>
    </>)
}

export default Register;