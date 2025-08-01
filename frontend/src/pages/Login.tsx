import axios, { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast, Toaster } from 'sonner';
import { FaGoogle } from "react-icons/fa";
import { CiLogin } from 'react-icons/ci';
import { IoIosHourglass } from 'react-icons/io';
import { MdEmail, MdPassword } from "react-icons/md";
import { useStore } from '../store/zustandHandler.ts'
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL

const Login = () => {
    const [isPending, setIsPending] = useState('idle');
    const navigate = useNavigate();
    const Email = useRef<HTMLInputElement>(null);
    const Password = useRef<HTMLInputElement>(null);

    const loggedIn = useStore((state) => state.Login)


    useEffect(() => {
        if (isPending === 'success') {
            navigate("/Interface")
        }
    }, [isPending])

    const HandleUserLogin = async () => {
        try {
            setIsPending('pending');
            if (!Email?.current?.value || !Password?.current?.value) {
                setIsPending("idle");
                toast("Please fill in all fields !");
                return;
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
                loggedIn()
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
    return (<>
        <div className="h-screen flex items-center justify-center relative z-[2]">
            <Toaster />

            {/* gradient accent background */}
            <div className="absolute h-full w-full top-0 left-0 bg-gradient-to-br from-pink-800/30 to-fushia-600/20 blur-2xl z-[-1]"></div>

            <motion.div drag whileDrag={{ scale: 0.9 }} dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }} className="bg-gradient-to-br from-gray-100 to-gray-200 grid grid-cols-1  py-6 px-4 rounded-lg gap-4 w-4/5 md:w-1/3 lg:w-1/3 shadow-sm shadow-black curso-grab">
                <h1 className="text-center space-grotesk font-bold  text-2xl">Welcome back </h1>
                <span className="text-xs text-gray-700 space-grotesk text-center">Login to continue contributing !</span>

                <span className="flex flex-col gap-2">
                    <label className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2" htmlFor="email"><MdEmail /> Email Address</label>
                    <input ref={Email} className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk" type="text" placeholder="Your email address" />
                </span>
                <span className="flex flex-col gap-2">
                    <label className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2" htmlFor="password"><MdPassword /> Password</label>
                    <input ref={Password} spellCheck className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk" type="text" placeholder="Choose a strong password" />
                </span>
                <Link to='/ResetPassword' className="bai-jamjuree-semibold text-xs text-end text-gray-500 hover:text-sky-600 transition-colors duration-300">Do not remember your password ?</Link>
                <span className="flex items-center justfify-center py-4 flex-col gap-2">
                    {isPending === 'idle' ? <motion.button whileHover={{ boxShadow: "2px 2px 2px black", transform: "translateY(-3px)" }} onClick={HandleUserLogin} whileTap={{ scale: 0.9, boxShadow: "2px 2px 2px blue" }} transition={{ duration: 0.2 }} className="bg-black py-2 px-3 rounded-lg space-grotesk text-white w-full CustPoint flex items-center justify-center gap-2">Login <CiLogin /></motion.button> : <motion.ul className='py-2 px-3 bg-gray-700 text-white space-grotesk w-full rounded-lg animate-pulse text-center flex items-center justify-center gap-2'>Please wait <IoIosHourglass className="animate-spin" /></motion.ul>}
                    <motion.button whileHover={{ boxShadow: "2px 2px 2px black", transform: "translateY(-3px)" }} whileTap={{ scale: 0.9, boxShadow: "2px 2px 2px black" }} transition={{ duration: 0.2 }} className="bg-gray-400 py-2 px-3 rounded-lg space-grotesk text-black w-full flex items-center justify-center gap-2 CustPoint ">Continue with Google <FaGoogle /></motion.button>
                </span>
                <ul className="space-grotesk  text-sm text-center ">New Here ?<Link className="text-transparent bg-clip-text font-semibold bg-gradient-to-r from-purple-600 to-blue-600 " to="/Register"> Register</Link></ul>
            </motion.div>

        </div>
    </>)
}

export default Login;