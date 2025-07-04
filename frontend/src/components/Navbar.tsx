import React, { useState } from 'react';
import { BiMenuAltRight } from "react-icons/bi";
import { Link } from "react-router";
import Sidebar from '@/components/Sidebar';
import { MdClose } from "react-icons/md";
import { motion, useScroll } from 'framer-motion';

type NavbarProps = {
    currTab: string;
    setCurrTab: React.Dispatch<React.SetStateAction<string>>;
};

const Navbar: React.FC<NavbarProps> = ({ currTab, setCurrTab }) => {

    const [isVisible, setIsVisible] = useState(false);
    const { scrollYProgress } = useScroll();

    return (<>
        <nav className="relative  py-1 px-6 flex items-center justify-between z-[1] overflow-x-hidden">
            {/* top scroll indicator */}
            <motion.div style={{ scaleX: scrollYProgress }} className='bg-lime-400 w-full fixed h-2 origin-left top-0 left-0 z-[9]' ></motion.div>

            {/* navlinks */}
            <Link to="/" className="font-mono text-2xl md:text-3xl  relative text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-700 font-bold CustPoint">EUe
            </Link>
            <div className="relative hidden md:flex items-center justify-center gap-3 text-sm space-grotesk">

                <Link onClick={() => setCurrTab("Home")} className={` rounded-lg py-1 px-2 ${currTab === "Home" ? " slider" : " text-black"} z-[1]`} to='/'>Home</Link>
                <Link onClick={() => setCurrTab("Try")} className={` rounded-lg py-1 px-2 ${currTab === "Try" ? "slider" : "bg-transparent text-black"}`} to='/Interface'>Try</Link>
                <Link onClick={() => setCurrTab("Details")} className={` rounded-lg py-1 px-2 ${currTab === "Details" ? "slider" : "bg-transparent text-black"}`} to='/Details'>Details</Link>
                <Link onClick={() => setCurrTab("About")} className={` rounded-lg py-1 px-2 ${currTab === "About" ? "slider" : "bg-transparent text-black"}`} to='/About'>Quick start</Link>
            </div>
            {isVisible === false ? <BiMenuAltRight onClick={() => setIsVisible(!isVisible)} className="md:hidden block cursor-pointer CustPoint" size={28} /> : <MdClose onClick={() => setIsVisible(!isVisible)} className="md:hidden block  CustPoint" size={28} />}

        </nav>
        <Sidebar isVisble={isVisible} setIsVisible={setIsVisible} />

    </>)
}

export default Navbar