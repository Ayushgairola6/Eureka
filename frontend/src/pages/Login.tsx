import axios, { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast, Toaster } from 'sonner';
import { FaGoogle } from "react-icons/fa";
import { CiLogin } from 'react-icons/ci';
import { IoIosHourglass } from 'react-icons/io';
import { MdEmail, MdPassword } from "react-icons/md";
import { useAppDispatch, useAppSelector } from '../store/hooks.tsx';
import {setIsLogin}  from '../store/AuthSlice.ts';
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL

const Login = () => {

    const [isPending, setIsPending] = useState('idle');
    const navigate = useNavigate();
    const Email = useRef<HTMLInputElement>(null);
    const Password = useRef<HTMLInputElement>(null);
    const [isWeak, setIsWeak] = useState(false);
    const {isDarkMode} = useAppSelector(state=>state.auth);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (isPending === 'success') {
            navigate("/Interface")
        }
    }, [isPending])
    const PasswordMustSymbols = ["$", "@", "%", "#", "*", "!", "^", "&", '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    const HandleUserLogin = async () => {
        try {
            setIsPending('pending');
            if (!Email?.current?.value || !Password?.current?.value) {
                setIsPending("idle");
                toast("Please fill in all fields !");
                return;
            }

            if (!Email.current.value.split("").includes("@")) {
                setIsPending("idle")
                toast("Please Enter a valid email address");
                return
            }


            const userInformation = {
                email: Email.current?.value,
                password: Password.current?.value,
            }

            const response = await axios.post(`${BaseApiUrl}/api/user/login`, userInformation, {
                withCredentials: true,
                headers: {

                }
            })
            // console.log(response.data)

            if (response.data.message === "Login successfull") {
                setIsPending("success");
                dispatch(setIsLogin(true));
                setTimeout(() => {
                    setIsPending("idle");
                }, 3000)
                // console.log(response.data)
                localStorage.setItem("Eureka_six_eta_v1_Authtoken", response.data.AuthToken)
            }
        } catch (error: unknown) {
            setIsPending('failed');

            if (isAxiosError(error)) {
                if (error.response?.data?.message === "User not found !") {
                    toast("User not found !");
                } else {
                    toast("Error while logging into your Account");
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

    // checking password strength
    const CheckPasswordStrength = () => {
        if (Password?.current?.value) {
            // Check if password contains at least one symbol from PasswordMustSymbols
            const hasSymbol = PasswordMustSymbols.some(symbol =>
                Password?.current?.value.includes(symbol)
            );

            setIsWeak(!hasSymbol);
        }
    }

    return (<>
        <div className="h-screen flex items-center justify-center relative z-[2]  dark:bg-black ">
            <Toaster />

            {/* gradient accent background */}
            {!isDarkMode && <div className="absolute h-full w-full top-0 left-0  blur-2xl z-[-1] bg-gradient-to-br from-pink-600/30 to-fuchsia-600/30 "></div>}

            <motion.div drag whileDrag={{ scale: 0.9 }} dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }} className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/10 dark:to-indigo-900/20 grid grid-cols-1  py-6 px-4 rounded-lg gap-4 w-4/5 md:w-1/3 lg:w-1/3 shadow-sm shadow-black cursor-grab border dark:border-gray-400">
                <h1 className="text-center space-grotesk font-bold  text-2xl">Welcome back </h1>
                <span className="text-xs text-gray-700 dark:text-gray-400 space-grotesk text-center">Login to continue contributing !</span>

                <span className="flex flex-col gap-2">
                    <label className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2" htmlFor="email"><MdEmail /> Email Address</label>
                    <input ref={Email} className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk" type="text" placeholder="Your email address" />
                </span>
                <span className="flex flex-col gap-2">
                    <label className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2" htmlFor="password"><MdPassword /> Password</label>
                    <input
                        onChange={CheckPasswordStrength}
                        ref={Password}
                        spellCheck
                        className={`border px-2 py-1 rounded-lg space-grotesk transition-colors duration-200
                      ${isWeak === true ? " focus:border-red-600 border-red-600" : "focus:border-blue-600 border-gray-300"}`}
                        type="text"
                        placeholder="Choose a strong password"
                    />
                </span>
                <Link to='/ResetPassword' className="bai-jamjuree-semibold text-xs text-end text-gray-500 dark:text-gray-300 dark:hover:text-sky-600 hover:text-sky-600 transition-colors duration-300">Do not remember your password ?</Link>
                <span className="flex items-center justfify-center py-4 flex-col gap-2">
                    {/*normal button */}
                    <motion.button disabled={isPending !== 'idle'} whileHover={{ boxShadow: "2px 2px 2px black", transform: "translateY(-3px)" }} onClick={HandleUserLogin} whileTap={{ scale: 0.9, boxShadow: "2px 2px 2px blue" }} transition={{ duration: 0.2 }} className="bg-black text-white dark:bg-white dark:text-black py-2 px-3 rounded-lg space-grotesk  w-full CustPoint flex items-center justify-center gap-2">{isPending === "idle" ? (
                        <>
                            Login <CiLogin />
                        </>
                    ) : (
                        <>
                            Please wait <IoIosHourglass className="animate-spin" />
                        </>
                    )}</motion.button>

                    {/* google button */}
                    <motion.button whileHover={{ boxShadow: "2px 2px 2px black", transform: "translateY(-3px)" }} whileTap={{ scale: 0.9, boxShadow: "2px 2px 2px black" }} transition={{ duration: 0.2 }} className="bg-indigo-400 py-2 px-3 rounded-lg space-grotesk text-black w-full flex items-center justify-center gap-2 CustPoint ">Login with Google <FaGoogle /></motion.button>
                </span>
                <ul className="space-grotesk  text-sm text-center ">New Here ?<Link className="text-transparent bg-clip-text font-semibold bg-gradient-to-r from-purple-600 to-blue-600 " to="/Register"> Register</Link></ul>
            </motion.div>

        </div>
    </>)
}

export default Login;