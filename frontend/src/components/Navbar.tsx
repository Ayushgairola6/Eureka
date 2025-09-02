import { useState } from 'react';
import { BiLogIn, BiMenuAltRight } from "react-icons/bi";
import { IoIosNotificationsOutline } from "react-icons/io";
import { Link } from "react-router";
import Sidebar from '@/components/Sidebar';
import { MdClose } from "react-icons/md";
import { motion, useScroll } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks.tsx';
import { IoBulbOutline, IoMoonOutline } from 'react-icons/io5'
import { PiUserRectangleBold } from 'react-icons/pi';
import { toggleTheme, setCurrTab } from '../store/AuthSlice.ts';
import { setOpen } from '../store/chatRoomSlice.ts';
import NotificationPanel from '@/components/notificationBar.tsx';


const Navbar = () => {

    const [isVisible, setIsVisible] = useState(false);
    const dispatch = useAppDispatch()
    const { scrollYProgress } = useScroll();
    const notificationcount = useAppSelector(state => state.auth.notificationcount)
    const User = useAppSelector((state) => state.auth.user)
    const { isDarkMode, isLoggedIn } = useAppSelector(state => state.auth);
    const isOpen = useAppSelector(state => state.chats.isOpen)
    // const {isOpen} = useAppSelector(state=>state.chats)
    const { currTab } = useAppSelector(state => state.auth);

    return (<>
        <nav className={`relative bg-gray-100 py-1 px-6 flex items-center justify-between z-[3] overflow-x-hidden dark:text-white text-black dark:bg-black `}>

            {/* top scroll indicator */}
            <motion.div style={{ scaleX: scrollYProgress }} className='bg-indigo-500 w-full fixed py-1 origin-left top-0 left-0 z-[99]' ></motion.div>

            {/* navlinks */}
            <Link to="/" className="CustPoint">
                {/* EUREKA */}
                <img className="h-10 w-10  rounded-full dark:bg-gray-200" src="/Group 1.svg" alt="" />
            </Link>

            <div className={`relative hidden md:flex items-center justify-center gap-3 text-sm space-grotesk dark:text-white text-black `}>

                <Link onClick={() => dispatch(setCurrTab("Home"))} className={` rounded-lg py-1 px-2 hover:bg-indigo-300 transition-all duration-300 ${currTab === "Home" ? " slider" : " "} z-[1]`} to='/'>Home</Link>
                <Link onClick={() => dispatch(setCurrTab("Try"))} className={` rounded-lg py-1 px-2 hover:bg-indigo-300 transition-all duration-300 ${currTab === "Try" ? "slider" : "bg-transparent "}`} to='/Interface'>Try Now</Link>
                {/* <Link onClick={() => setCurrTab("Details")} className={` rounded-lg py-1 px-2 ${currTab === "Details" ? "slider" : "bg-transparent text-black"}`} to='/Details'>Details</Link> */}
                <Link onClick={() => dispatch(setCurrTab("About"))} className={` rounded-lg py-1 px-2 hover:bg-indigo-300 transition-all duration-300 ${currTab === "About" ? "slider" : "bg-transparent "}`} to='/About'>Quick start</Link>
                <Link onClick={() => dispatch(setCurrTab("Feedback"))} className={` rounded-lg py-1 px-2 hover:bg-indigo-300 transition-all duration-300 ${currTab === "Feedback" ? "slider" : "bg-transparent "}`} to='/Feedback'>Feedback</Link>
                <Link onClick={() => dispatch(setCurrTab("API"))} className={` rounded-lg py-1 px-2 hover:bg-indigo-300 transition-all duration-300 ${currTab === "API" ? "slider" : "bg-transparent "}`} to='/API/featured'>API</Link>

                {/* only render if the user is not logged In */}
                {isLoggedIn === true && < Link onClick={() => dispatch(setCurrTab("DashBoard"))} className={` rounded-lg py-1 px-2 hover:bg-indigo-300 transition-all duration-300 ${currTab === "DashBoard" ? "slider" : "bg-transparent "}`} to='/User/dashboard'>DashBoard</Link>}


                {/* end */}
            </div>

            <div className='flex items-center justify-center gap-3 bai-jamjuree-regular text-sm overflow-y-clip'>
                {isLoggedIn === true && <ul onClick={() => dispatch(setOpen(!isOpen))} className='cursor-pointer dark:bg-white/20 bg-indigo-100 rounded-full p-2 relative hover:bg-indigo-200 dark:hover:bg-white/30 transition-colors'>
                    <IoIosNotificationsOutline
                        size={22}
                    />
                    <span className='animate-bounce absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-medium text-white bg-red-600 rounded-full border-2 border-white dark:border-gray-900'>
                        {notificationcount}
                    </span>
                </ul>}

                <ul className='cursor-pointer dark:bg-white/20 bg-indigo-100 rounded-full p-2 relative hover:bg-indigo-200 dark:hover:bg-white/30 transition-colors' onClick={() => dispatch(toggleTheme())}>
                    {isDarkMode ? <IoBulbOutline size={18} />
                        : <IoMoonOutline size={18} />}
                </ul>

                {isLoggedIn === false && <Link onClick={() => { dispatch(setCurrTab("Login")) }} className={`hidden rounded-lg py-1 px-2 hover:bg-indigo-300 transition-all duration-300 md:flex items-center justify-center gap-2 ${currTab === "Login" ? "slider" : "bg-indigo-300   text-black "}`} to='/Login'>Login <BiLogIn /></Link>}
                {isLoggedIn === false && <Link onClick={() => dispatch(setCurrTab("Register"))} className={`hidden rounded-lg py-1 px-3 hover:bg-indigo-300 transition-all duration-300 md:flex items-center justify-center gap-2 ${currTab === "Register" ? "slider" : "bg-black dark:bg-white text-white dark:text-black"}`} to='/Register'>Register <PiUserRectangleBold /></Link>}
                {isLoggedIn === true ? <Link to='user/dashboard'> <ul className='CustPoint uppercase bg-indigo-500 rounded-full h-8 w-8 text-xl flex items-center justify-center text-white dark:text-black space-grotesk font-bold'>{User?.username.trim().split("")[0].toUpperCase()}</ul></Link> : null}
                {isVisible === false ? <BiMenuAltRight onClick={() => setIsVisible(!isVisible)} className="md:hidden block cursor-pointer " size={28} /> : <MdClose onClick={() => setIsVisible(!isVisible)} className="md:hidden block  CustPoint" size={28} />}

            </div>
        </nav >
        <Sidebar isVisble={isVisible} setIsVisible={setIsVisible} />
        <NotificationPanel />

    </>)
}

export default Navbar