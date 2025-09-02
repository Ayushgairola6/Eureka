import { motion } from 'framer-motion';
import { IoInformationOutline, IoSpeedometerOutline } from "react-icons/io5";
import { PiTargetDuotone } from "react-icons/pi";
import { GoVerified } from "react-icons/go";
import { IoPeopleSharp } from "react-icons/io5";
import { IoLogoGithub } from "react-icons/io5";

const Marquee = () => {

    return (<>
        <motion.div className={`"flex items-center justify-center py-2 px-2 overflow-x-hidden gap-20 space-grotesk uppercase dark:bg-black dark:text-white bg-white text-black z-[2] font-bold "`}>
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
                <div className="text-2xl md:text-2xl rounded-lg    px-3 text-nowrap flex items-center justify-center gap-3">
                    <IoInformationOutline />

                    <ul>Information</ul>
                </div>
                <div className="text-xl md:text-2xl rounded-lg    px-3 text-nowrap flex items-center justify-center gap-3">
                    <IoSpeedometerOutline />

                    <ul>Faster</ul>

                </div>
                <div className="text-xl md:text-2xl rounded-lg    px-3 text-nowrap flex items-center justify-center gap-3">
                    <PiTargetDuotone />

                    <ul>Accurate</ul>

                </div>
                <div className="text-xl md:text-2xl rounded-lg    px-3 text-nowrap flex items-center justify-center gap-3">
                    <GoVerified />

                    <ul>Verified</ul>

                </div>
                <div className="text-xl md:text-2xl rounded-lg    px-3 text-nowrap flex items-center justify-center gap-3">
                    <IoPeopleSharp />

                    <ul>Collaborated</ul>

                </div>
                <div className="text-xl md:text-2xl rounded-lg    px-3 text-nowrap flex items-center justify-center gap-3">
                    <IoLogoGithub />

                    <ul>Open Source</ul>

                </div>
            </motion.div>
        </motion.div>


    </>)
}

export default Marquee;