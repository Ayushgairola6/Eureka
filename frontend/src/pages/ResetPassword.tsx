import { Toaster, toast } from 'sonner';
import { motion } from 'framer-motion';
import { Link } from 'react-router'
import { IoIosHourglass } from 'react-icons/io';
import { MdEmail, MdPassword } from 'react-icons/md';
import { useState, useRef } from 'react';

const ResetPassword = () => {
    const [isPending, setIsPending] = useState('idle')
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
                    <input className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk" type="text" placeholder="Your email address" />
                </span>
                <span className="flex flex-col gap-2">
                    <label className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2" htmlFor="password"><MdPassword />New Password</label>
                    <input spellCheck className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk" type="text" placeholder="Choose a strong password" />
                </span>
                <span className="flex flex-col gap-2">
                    <label className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2" htmlFor="password"><MdPassword />New Password</label>
                    <input spellCheck className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk" type="text" placeholder="Choose a strong password" />
                </span>
                <span className="flex items-center justfify-center py-4 flex-col gap-2">
                    {isPending === "idle" ? <motion.button whileHover={{ boxShadow: "2px 2px 2px black", transform: "translateY(-3px)" }} whileTap={{ scale: 0.9, boxShadow: "2px 2px 2px blue" }} transition={{ duration: 0.2 }} className="bg-black py-2 px-3 rounded-lg space-grotesk text-white w-full CustPoint flex items-center justify-center gap-2">Login </motion.button> : <motion.ul className='py-2 px-3 bg-gray-700 text-white space-grotesk w-full rounded-lg animate-pulse text-center flex items-center justify-center gap-2'>Please wait <IoIosHourglass className="animate-spin" /></motion.ul>}

                </span>
                <ul className="space-grotesk  text-sm text-center ">Have an Account?<Link className="text-transparent bg-clip-text font-semibold bg-gradient-to-r from-purple-600 to-blue-600 " to="/Login"> Login</Link></ul>
            </motion.div>

        </div>
    </>)
}

export default ResetPassword;