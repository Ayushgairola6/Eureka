import React from 'react';
import { BsLightningChargeFill } from "react-icons/bs";
import study from '../assets/study.jpg';
import research from '../assets/research.jpg';
const Testimonials = React.lazy(() => import('@/components/Testimonials'));
const Why = React.lazy(() => import('./Why.tsx'));
const Pricing = React.lazy(() => import('@/components/Pricing'));
const Tutorial = React.lazy(() => import("./Tutorial.tsx"));
import { Link } from 'react-router';
import { motion } from 'framer-motion'
import Marquee from '@/components/marquee';
import { useAppSelector } from '../store/hooks.tsx';

const LandingPage = () => {
    const isDarkMode = useAppSelector(state => state.auth.isDarkMode);
    return (<>
        {/*  ${isDarkMode?"bg-black text-white":"bg-white text-black"}*/}
        <div className={`dark:bg-black dark:text-white bg-white text-black relative flex items-center justify-center flex-wrap max-w-screen min-h-screen w-full overflow-hidden  z-[1] `}>
            {!isDarkMode && <div className='h-full w-full absolute z-[-1] bg-gradient-to-br from-white to-emerald-600/20 blur-3xl'>
            </div>}
            <div className="px-4 py-7 flex md:flex-row flex-col items-center justify-between relative">

                <div className="h-full w-full flex items-center justify-center p-4">
                    <div className="relative w-full max-w-2xl aspect-square">
                        {/* Main Brain Image Container */}
                        <div className="overflow-hidden h-[90%] w-[90%] m-auto rounded-full relative  dark:border-gray-800 shadow-2xl">
                            <picture>
                                <source srcSet="/brain1.jpg" type="image/webp" />
                                <source srcSet="/brain1.jpg" type="image/jpeg" />
                                <img
                                    loading="lazy"
                                    className="object-cover h-full w-full contrast-125 brightness-110 dark:brightness-90 dark:contrast-110"
                                    src="/brain1.jpg"
                                    alt="Brain illustration"
                                />
                            </picture>
                             
                        </div>
                       
                        {/* Study Icon */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 group pointer-events-auto">
                            <div className="relative">
                                <div className="rounded-full h-12 w-12 md:h-20 md:w-20 shadow-lg transform group-hover:scale-110 transition-all duration-300 cursor-pointer animate-float z-20 bg-white dark:bg-gray-800 p-2  flex items-center justify-center">
                                    <picture>
                                        <source srcSet={study} type="image/webp" />
                                        <source srcSet={study} type="image/jpeg" />
                                        <img
                                            className="rounded-full"
                                            src={study}
                                            alt="Study icon"
                                        />
                                    </picture>
                                </div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-48 text-sm z-30 border border-gray-200 dark:border-gray-700">
                                    Study materials and resources
                                    <div className="absolute -top-2 left-1/2 w-4 h-4 bg-white dark:bg-gray-900 transform -translate-x-1/2 rotate-45 border-t border-l border-gray-200 dark:border-gray-700"></div>
                                </div>
                            </div>
                        </div>

                        {/* Research Icon */}
                        <div className="absolute bottom-10 right-8 md:right-8 group pointer-events-auto">
                            <div className="relative">
                                <div className="rounded-full h-12 w-12 md:h-20 md:w-20 shadow-lg transform group-hover:scale-110 transition-all duration-300 cursor-pointer animate-float z-20 bg-white dark:bg-gray-800 p-2 flex items-center justify-center">
                                    <picture>
                                        <source srcSet={research} type="image/webp" />
                                        <source srcSet={research} type="image/jpeg" />
                                        <img
                                            className="rounded-full"
                                            src={research}
                                            alt="Research icon"
                                        />
                                    </picture>
                                </div>
                                <div className="absolute top-1/2 right-full transform -translate-y-1/2 mr-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity w-48 text-sm duration-300 z-30 border border-gray-200 dark:border-gray-700">
                                    Research findings and data
                                    <div className="absolute top-1/2 left-full w-4 h-4 bg-white dark:bg-gray-900 transform -translate-y-1/2 rotate-45 border-t border-r border-gray-200 dark:border-gray-700"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="text-center flex items-center justify-center flex-col gap-2 relative">
                    {/* <img className='absolute top-0 -right-10 h-1/2 rotate-60 w-full z-[-1] rounded-full h-' src="/bolt.png" alt="" /> */}

                    <h1 className="space-grotesk text-5xl md:text-6xl lg:text-7xl font-bold text-center ">
                        The collaborative, <span className="cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-sky-600">Community-powered</span> knowledge agent—customized for you
                    </h1>
                    <h2 className="bai-jamjuree-light text-xs md:text-sm text-center  ">
                        With <Link to="/Interface" className='text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-sky-600 font-bold'>EUREKA</Link>, anyone can access reliable information on any topic, curated and verified by the community. Effortlessly share, discover, and manage knowledge—including your own private documents—for faster, smarter learning.
                    </h2>
                    <motion.ul whileHover={{ scale: 1.05, transform: "translateX(50px)" }} transition={{ duration: 0.6, ease: "circInOut" }} whileTap={{ scale: 1.09, transform: "translateX(40px)" }} >
                        <Link
                            to="/Interface" className={`' p-3  overflow-x-hidden  rounded-lg dark:bg-white dark:text-black bg-black text-white  space-grotesk flex items-center justify-center gap-2 mt-10 CustPoint     transition-all duration-500 '`}>Try for free<ul  ><BsLightningChargeFill /></ul></Link>
                    </motion.ul>
                </section>

            </div>



        </div>
        <Why />
        <Testimonials />
        <Tutorial />
        <Pricing />
        <Marquee />

    </>
    );
};

export default LandingPage;


