import React, { useState } from 'react';
import { BiMenuAltRight } from "react-icons/bi";
import { Link } from "react-router";
import Sidebar from '@/components/Sidebar';
import { MdClose } from "react-icons/md";
import { motion, useScroll } from 'framer-motion';
import { useStore } from '../store/zustandHandler.ts';
import { useAppSelector } from '../store/hooks.tsx';
type NavbarProps = {
    currTab: string;
    setCurrTab: React.Dispatch<React.SetStateAction<string>>;
};

const Navbar: React.FC<NavbarProps> = ({ currTab, setCurrTab }) => {

    const [isVisible, setIsVisible] = useState(false);
    const { scrollYProgress } = useScroll();
    const LoggedIn = useStore((state) => state.isLoggedIn)
    const User = useAppSelector((state) => state.auth.user)
    return (<>
        <nav  className="relative  py-1 px-6 flex items-center justify-between z-[] overflow-x-hidden">
            {/* top scroll indicator */}
            <motion.div style={{ scaleX: scrollYProgress }} className='bg-indigo-500 w-full fixed py-1 origin-left top-0 left-0 z-[99]' ></motion.div>

            {/* navlinks */}
            <Link to="/" className="font-mono text-2xl md:text-3xl  relative text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-700 font-bold CustPoint">EUe
            </Link>
            <div className="relative hidden md:flex items-center justify-center gap-3 text-sm space-grotesk">

                <Link onClick={() => setCurrTab("Home")} className={` rounded-lg py-1 px-2 hover:bg-gray-400 transition-all duration-300 ${currTab === "Home" ? " slider" : " text-black"} z-[1]`} to='/'>Home</Link>
                <Link onClick={() => setCurrTab("Try")} className={` rounded-lg py-1 px-2 hover:bg-gray-400 transition-all duration-300 ${currTab === "Try" ? "slider" : "bg-transparent text-black"}`} to='/Interface'>Try Now</Link>
                {/* <Link onClick={() => setCurrTab("Details")} className={` rounded-lg py-1 px-2 ${currTab === "Details" ? "slider" : "bg-transparent text-black"}`} to='/Details'>Details</Link> */}
                <Link onClick={() => setCurrTab("About")} className={` rounded-lg py-1 px-2 hover:bg-gray-400 transition-all duration-300 ${currTab === "About" ? "slider" : "bg-transparent text-black"}`} to='/About'>Quick start</Link>
                <Link onClick={() => setCurrTab("Feedback")} className={` rounded-lg py-1 px-2 hover:bg-gray-400 transition-all duration-300 ${currTab === "Feedback" ? "slider" : "bg-transparent text-black"}`} to='/Feedback'>Feedback</Link>
                 <Link onClick={() => setCurrTab("API")} className={` rounded-lg py-1 px-2 hover:bg-gray-400 transition-all duration-300 ${currTab === "API" ? "slider" : "bg-transparent text-black"}`} to='/API/featured'>API</Link>

                {/* only render if the user is not logged In */}
                {LoggedIn === false && <Link onClick={() => setCurrTab("Login")} className={` rounded-lg py-1 px-2 hover:bg-gray-400 transition-all duration-300 ${currTab === "Login" ? "slider" : "bg-transparent text-black"}`} to='/Login'>Login</Link>}
                {LoggedIn === false && <Link onClick={() => setCurrTab("Register")} className={` rounded-lg py-1 px-2 hover:bg-gray-400 transition-all duration-300 ${currTab === "Register" ? "slider" : "bg-transparent text-black"}`} to='/Register'>Register</Link>}
                {/* end */}
            </div>
            <div className='flex items-center justify-center gap-3'>
                {isVisible === false ? <BiMenuAltRight onClick={() => setIsVisible(!isVisible)} className="md:hidden block cursor-pointer " size={28} /> : <MdClose onClick={() => setIsVisible(!isVisible)} className="md:hidden block  CustPoint" size={28} />}
                {LoggedIn === true ? <ul className='CustPoint uppercase bg-sky-300 rounded-full px-2  space-grotesk font-bold'>{User?.username.split(" ")[0].split("")[0]}</ul> : null}
            </div>

        </nav>
        <Sidebar isVisble={isVisible} setIsVisible={setIsVisible} />

    </>)
}

export default Navbar