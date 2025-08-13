import React, { useState } from 'react';
import { BiLogIn, BiMenuAltRight } from "react-icons/bi";
import { Link } from "react-router";
import Sidebar from '@/components/Sidebar';
import { MdClose } from "react-icons/md";
import { motion, useScroll } from 'framer-motion';
import { useStore } from '../store/zustandHandler.ts';
import { useAppSelector } from '../store/hooks.tsx';
import { IoBulbOutline, IoMoonOutline } from 'react-icons/io5'
import { PiUserRectangleBold } from 'react-icons/pi';

type NavbarProps = {
    currTab: string;
    setCurrTab: React.Dispatch<React.SetStateAction<string>>;
};

const Navbar: React.FC<NavbarProps> = ({ currTab, setCurrTab }) => {

    const [isVisible, setIsVisible] = useState(false);
    const { scrollYProgress } = useScroll();
    const LoggedIn = useStore((state) => state.isLoggedIn)
    const ToggleTheme = useStore((state) => state.toggleTheme);
    const isDark = useStore((state) => state.isDarkMode)
    const User = useAppSelector((state) => state.auth.user)
    return (<>
        <nav  className={`relative bg-gray-100 py-1 px-6 flex items-center justify-between z-[3] overflow-x-hidden dark:text-white text-black dark:bg-black `}>
            {/* top scroll indicator */}
            <motion.div style={{ scaleX: scrollYProgress }} className='bg-indigo-500 w-full fixed py-1 origin-left top-0 left-0 z-[99]' ></motion.div>

            {/* navlinks */}
            <Link to="/" className="font-mono text-2xl md:text-3xl  relative  font-bold CustPoint">EUe
            </Link>
            <div className={`relative hidden md:flex items-center justify-center gap-3 text-sm space-grotesk dark:text-white text-black `}>

                <Link onClick={() => setCurrTab("Home")} className={` rounded-lg py-1 px-2 hover:bg-gray-400 transition-all duration-300 ${currTab === "Home" ? " slider" : " "} z-[1]`} to='/'>Home</Link>
                <Link onClick={() => setCurrTab("Try")} className={` rounded-lg py-1 px-2 hover:bg-gray-400 transition-all duration-300 ${currTab === "Try" ? "slider" : "bg-transparent "}`} to='/Interface'>Try Now</Link>
                {/* <Link onClick={() => setCurrTab("Details")} className={` rounded-lg py-1 px-2 ${currTab === "Details" ? "slider" : "bg-transparent text-black"}`} to='/Details'>Details</Link> */}
                <Link onClick={() => setCurrTab("About")} className={` rounded-lg py-1 px-2 hover:bg-gray-400 transition-all duration-300 ${currTab === "About" ? "slider" : "bg-transparent "}`} to='/About'>Quick start</Link>
                <Link onClick={() => setCurrTab("Feedback")} className={` rounded-lg py-1 px-2 hover:bg-gray-400 transition-all duration-300 ${currTab === "Feedback" ? "slider" : "bg-transparent "}`} to='/Feedback'>Feedback</Link>
                <Link onClick={() => setCurrTab("API")} className={` rounded-lg py-1 px-2 hover:bg-gray-400 transition-all duration-300 ${currTab === "API" ? "slider" : "bg-transparent "}`} to='/API/featured'>API</Link>

                {/* only render if the user is not logged In */}
                {LoggedIn === true && < Link onClick={() => setCurrTab("DashBoard")} className={` rounded-lg py-1 px-2 hover:bg-gray-400 transition-all duration-300 ${currTab === "DashBoard" ? "slider" : "bg-transparent "}`} to='/User/dashboard'>DashBoard</Link>}


                {/* end */}
            </div>

            <div className='flex items-center justify-center gap-3 bai-jamjuree-regular text-sm'>

                <ul className='cursor-pointer' onClick={ToggleTheme}>
                    {isDark ? <IoBulbOutline size={20} />
                        : <IoMoonOutline size={18} />}
                </ul>
                {LoggedIn === false && <Link onClick={() => { setCurrTab("Login") }} className={`hidden rounded-lg py-1 px-2 hover:bg-gray-400 transition-all duration-300 md:flex items-center justify-center gap-2 ${currTab === "Login" ? "slider" : "bg-gray-400   text-black "}`} to='/Login'>Login <BiLogIn/></Link>}
                {LoggedIn === false && <Link onClick={() => setCurrTab("Register")} className={`hidden rounded-lg py-1 px-3 hover:bg-gray-400 transition-all duration-300 md:flex items-center justify-center gap-2 ${currTab === "Register" ? "slider" : "bg-black dark:bg-white text-white dark:text-black"}`} to='/Register'>Register <PiUserRectangleBold /></Link>}
                {isVisible === false ? <BiMenuAltRight onClick={() => setIsVisible(!isVisible)} className="md:hidden block cursor-pointer " size={28} /> : <MdClose onClick={() => setIsVisible(!isVisible)} className="md:hidden block  CustPoint" size={28} />}
                {LoggedIn === true ? <Link to='user/dashboard'> <ul className='CustPoint uppercase bg-sky-300 rounded-full px-2 text-white dark:text-black space-grotesk font-bold'>{User?.username.trim().split("")[0].toUpperCase()}</ul></Link> : null}
            </div>
        </nav >
        <Sidebar isVisble={isVisible} setIsVisible={setIsVisible} />

    </>)
}

export default Navbar