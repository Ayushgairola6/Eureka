import React from 'react';

import { FiArrowUpRight } from 'react-icons/fi';
// import Footer from '@/components/Footer';
import study from '../assets/study.jpg';
import research from '../assets/research.jpg';
import brain from '../assets/brain.jpg'
const Testimonials = React.lazy(() => import('@/components/Testimonials'));
const Why = React.lazy(() => import('./Why'));
const Pricing = React.lazy(() => import('@/components/Pricing'));
import { Link } from 'react-router';
import { motion } from 'framer-motion'
import Marquee from '@/components/marquee';

//  className="bg-blend-difference object-cover  h-full w-full "
const LandingPage = () => {
    return (<>
        <div className="relative flex items-center justify-center flex-wrap max-w-screen min-h-screen w-full overflow-hidden  z-[1]">
            <div className='h-full w-full absolute z-[-1] bg-gradient-to-br from-white to-emerald-600/10 blur-3xl'>
            </div>
            <div className="px-4 py-10 flex md:flex-row flex-col items-center justify-between ">

                <div className="h-full w-full flex items-center justify-center p-4">
                    <div className="relative z-[-1] w-full max-w-2xl aspect-square  ">
                        <div className="bg-gray-200/10  overflow-hidden h-full w-full ">
                            <picture>
                                <source srcSet={brain} type="image/webp" />
                                <source srcSet={brain} type="image/jpeg" />
                                <img
                                    loading="lazy"
                                    className="bg-blend-difference object-cover  h-full w-full "
                                    src={brain}
                                    alt="Brain illustration"
                                />
                            </picture>
                        </div>

                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 group pointer-events-auto">
                            <div className="relative">
                                <picture>
                                    <source srcSet={study} type="image/webp" />
                                    <source srcSet={study} type="image/jpeg" />
                                    <img
                                        className="rounded-full h-16 w-16 md:h-20 md:w-20 border-1 border-sky-500/20 shadow-lg transform group-hover:scale-110 transition-all duration-300 CustPoint animate-float "
                                        src={study}
                                        alt="Study icon"
                                    />
                                </picture>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black text-white p-2 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-48 text-sm">
                                    Study materials and resources
                                    <div className="absolute -top-2 left-1/2 w-4 h-4 bg-white transform -translate-x-1/2 rotate-45"></div>
                                </div>
                            </div>

                        </div>


                        <div className="absolute bottom-2 right-8 group pointer-events-auto">
                            <div className="relative">
                                <picture>
                                    <source srcSet={research} type="image/webp" />
                                    <source srcSet={research} type="image/jpeg" />
                                <img
                                    className="rounded-full h-16 w-16 md:h-20 md:w-20 border-1 border-sky-500/20 shadow-lg transform group-hover:scale-110 transition-all duration-300 cursor-pointer animate-float-delay "
                                    src={research}
                                    alt="Research icon"
                                />
                               </picture>
                                <div className="absolute top-1/2 right-full transform -translate-y-1/2 mr-2 bg-black text-white p-2 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity w-48 text-sm duration-300" >
                                    Research findings and data
                                    <div className="absolute top-1/2 left-full w-4 h-4 bg-white transform -translate-y-1/2 rotate-45"></div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                <section className="text-center flex items-center justify-center flex-col gap-2">
                    <h1 className="space-grotesk text-4xl md:text-5xl lg:text-7xl font-bold text-center text-gray-800 md:text-black">
                        The open-source, <span className="cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-sky-600">community-powered</span> knowledge agent—customized for you
                    </h1>
                    <h2 className="bai-jamjuree-light text-xs md:text-lg text-center text-black ">
                        With <Link to="/Interface" className='text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-sky-600 font-bold'>EUREKA</Link>, anyone can access reliable information on any topic, curated and verified by the community. Effortlessly share, discover, and manage knowledge—including your own private documents—for faster, smarter learning.
                    </h2>
                    <motion.ul whileHover={{ scale: 1.05, transform: "translateX(50px)" }} transition={{ duration: 0.6, ease: "circInOut" }} whileTap={{ scale: 1.09, transform: "translateX(40px)" }} >
                        <Link
                            to="/Interface" className=' p-3  overflow-x-hidden  rounded-lg bg-black text-white space-grotesk flex items-center justify-center gap-2 mt-10 CustPoint     transition-all duration-500 '>Try for free<ul  ><FiArrowUpRight className='' /></ul></Link>
                    </motion.ul>
                </section>

            </div>



        </div>

        <Why />
        <Testimonials />
        <Pricing />
        <Marquee />

    </>
    );
};

export default LandingPage;


