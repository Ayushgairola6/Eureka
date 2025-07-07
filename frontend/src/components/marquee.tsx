import { motion } from 'framer-motion';
import { IoInformationOutline,IoSpeedometerOutline  } from "react-icons/io5";
import { PiTargetDuotone } from "react-icons/pi";
import { GoVerified } from "react-icons/go";
import { IoPeopleSharp } from "react-icons/io5";
import { IoLogoGithub } from "react-icons/io5";
const Marquee = () => {


    return (<>
        <motion.div className="flex items-center justify-center py-2 px-2 overflow-x-hidden gap-20 space-grotesk uppercase bg-gradient-to-br from-lime-600/20 to-blue-600/10 z-[2] font-bold">
            <motion.div
                initial={{ x: "50%" }}
                animate={{ x: "-100%" }}
                transition={{
                    ease: "linear",
                    duration: 60,
                    repeat: Infinity
                }}
                className="flex gap-5"
            >
                <div className="text-xl md:text-2xl rounded-lg    px-3 text-nowrap flex items-center justify-center gap-3">
                    <ul>Information</ul>
                    <IoInformationOutline />
                </div>
                <div className="text-xl md:text-2xl rounded-lg    px-3 text-nowrap flex items-center justify-center gap-3">
                    <ul>Faster</ul>
                    <IoSpeedometerOutline />

                </div>
                <div className="text-xl md:text-2xl rounded-lg    px-3 text-nowrap flex items-center justify-center gap-3">
                    <ul>Accurate</ul>
                    <PiTargetDuotone/>

                </div>
                <div className="text-xl md:text-2xl rounded-lg    px-3 text-nowrap flex items-center justify-center gap-3">
                    <ul>Verified</ul>
                    <GoVerified/>

                </div>
                <div className="text-xl md:text-2xl rounded-lg    px-3 text-nowrap flex items-center justify-center gap-3">
                    <ul>Collaborated</ul>
                    <IoPeopleSharp />

                </div>
                <div className="text-xl md:text-2xl rounded-lg    px-3 text-nowrap flex items-center justify-center gap-3">
                    <ul>Open Source</ul>
                    <IoLogoGithub />

                </div>
            </motion.div>
        </motion.div>


    </>)
}

export default Marquee;