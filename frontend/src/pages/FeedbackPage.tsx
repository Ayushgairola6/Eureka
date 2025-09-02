import axios from 'axios';
import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { FiMessageSquare, FiSend, FiStar, FiUser } from 'react-icons/fi';
import { useAppSelector } from '../store/hooks.tsx';
import { FaResearchgate } from 'react-icons/fa';
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL

const Feedback = () => {
    const InputRef = useRef<HTMLTextAreaElement>(null);
    const helpRef = useRef<HTMLInputElement>(null);
    const LoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
    const [isSending, setIsSending] = useState('idle')

    const HandleFormSubmit = async () => {
        setIsSending("pending")
        if (LoggedIn === false) {
            toast.info("Please Login to continue!");
            return;
        }
        if (InputRef?.current?.value === "" || helpRef.current?.value === "") {
            toast.info("All fields are neccessary !")
            setIsSending("idle")

            // console.log(InputRef?.current?.value, helpRef.current?.value)
            return;
        }
        const token = localStorage.getItem("Eureka_six_eta_v1_Auth_token");

        try {
            const response = await axios.post(`${BaseApiUrl}/api/user/review-data`, {
                review: InputRef.current?.value,
                where: helpRef.current?.value
            }, {
                withCredentials: true,
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.data.message === "Done") {
                // InputRef?.current?.value = "";
                // helpRef?.current?.value = "";
                setIsSending("idle")
                toast.message("Thanks for your valuable feedback !")
            } else {
                setIsSending("idle")
                toast.error("There was some error on the server , Please try again later !")
            }
        } catch (error) {
            setIsSending("idle")
            throw new Error("Error while Submitting Feedback");
        }
    }


    return (<>
        <div className="h-screen flex items-center justify-center relative z-[2]">
            <Toaster />

            {/* Gradient accent background */}
            <div className="absolute h-full w-full top-0 left-0 bg-gradient-to-br from-blue-800/30 to-cyan-600/20 dark:from-black dark:to-black blur-2xl z-[-1]"></div>

            <motion.div
                drag
                whileDrag={{ scale: 0.9 }}
                dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-black dark:to-white/10 grid grid-cols-1 py-6 px-4 rounded-lg gap-4 w-4/5 md:w-1/3 lg:w-1/3 shadow-sm shadow-black border dark:border-gray-400 text-black dark:text-white cursor-grab"
            >
                <h1 className="text-center space-grotesk font-bold text-2xl">Talk with us</h1>
                <span className="text-xs text-gray-700 dark:text-gray-300 space-grotesk text-center">We value your feedback!</span>

                <span className="flex flex-col gap-2">
                    <label className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2" htmlFor="name">
                        <FiUser /> Your Name
                    </label>
                    <input
                        className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk"
                        type="text"
                        placeholder="How should we call you?"
                    />
                </span>

                <span className="flex flex-col gap-2">
                    <label className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2" htmlFor="email">
                        <FaResearchgate /> What Eureka Helped with !
                    </label>
                    <input
                        ref={helpRef}
                        className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk"
                        type="text"
                        placeholder="Summarizing Research papers."
                    />
                </span>

                <span className="flex flex-col gap-2">
                    <label className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2" htmlFor="feedback">
                        <FiMessageSquare /> Your Feedback
                    </label>
                    <textarea
                        ref={InputRef}
                        className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk min-h-[120px]"
                        placeholder="What's on your mind?"
                        spellCheck
                    />
                </span>

                <span className="flex items-center justify-center py-4 flex-col gap-2">
                    <motion.button disabled={isSending === 'pending'} onClick={HandleFormSubmit}
                        whileHover={{ boxShadow: "2px 2px 2px black", transform: "translateY(-3px)" }}
                        whileTap={{ scale: 0.9, boxShadow: "2px 2px 2px blue" }}
                        transition={{ duration: 0.2 }}
                        className={`${isSending === "pending" ? "bg-gray-700 dark:bg-white/60" : "bg-black dark:bg-white"} py-2 px-3 rounded-lg space-grotesk dark:text-black text-white w-full CustPoint flex items-center justify-center gap-2`}
                    >
                        {isSending === "pending" ? "Sumbitting" : "Submit Feedback"} <FiSend />
                    </motion.button>

                    <motion.button
                        whileHover={{ boxShadow: "2px 2px 2px black", transform: "translateY(-3px)" }}
                        whileTap={{ scale: 0.9, boxShadow: "2px 2px 2px black" }}
                        transition={{ duration: 0.2 }}
                        className="bg-indigo-400 py-2 px-3 rounded-lg space-grotesk text-black w-full flex items-center justify-center gap-2 CustPoint"
                    >
                        Rate Us <FiStar />
                    </motion.button>
                </span>

                <ul className="space-grotesk text-sm text-center">
                    Need help? <Link className="text-transparent bg-clip-text font-semibold bg-gradient-to-r from-blue-600 to-cyan-600" to="/contact">Contact Support</Link>
                </ul>
            </motion.div>
        </div>
    </>)
}

export default Feedback;