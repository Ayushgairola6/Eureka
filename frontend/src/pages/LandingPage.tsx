import React from "react";
import { BsLightningChargeFill } from "react-icons/bs";
import study from "../assets/study.jpg";
import research from "../assets/research.jpg";
const Testimonials = React.lazy(() => import("@/components/Testimonials"));
const Why = React.lazy(() => import("./Why.tsx"));
const Pricing = React.lazy(() => import("@/components/Pricing"));
const Footer = React.lazy(() => import("@/components/Footer.tsx"));
import { Link } from "react-router";
import { motion } from "framer-motion";
import Marquee from "@/components/marquee";
const LandingPage = () => {
  return (
    <>
      <div
        className={`dark:bg-black dark:text-white bg-white text-black relative flex items-center justify-center flex-wrap max-w-screen min-h-screen w-full overflow-hidden  z-[1] relative`}
      >
        <section
          className="bg-[url('/gridpng.png')] 
   [background-size:1000px_500px] h-full w-full absolute top-0 left-0 dark:opacity-20 opacity-50 z-[-2]"
        ></section>
        <div className="px-4 py-7 flex md:flex-row flex-col items-center justify-between relative    ">
          <div
            className={` h-full w-full flex items-center justify-center p-4 `}
          >
            <div className="relative w-full max-w-2xl aspect-square ">
              <div className="w-full max-w-lg rounded-full">
                {/* Image 1: Visible ONLY in Light Mode */}
                <img
                  src="/Illustration.png"
                  alt="Research Engine Light"
                  className=" rounded-full "
                />

                {/* Image 2: Visible ONLY in Dark Mode */}
                {/* <img
                  src="/landingpage.png"
                  alt="Research Engine Dark"
                  className="hidden dark:block rounded-full"
                /> */}
              </div>
              {/* Study Icon */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 group pointer-events-auto">
                <div className="relative">
                  <div className="rounded-full h-12 w-12 md:h-15 md:w-15 shadow-lg transform group-hover:scale-110 transition-all duration-300 cursor-pointer animate-float z-20 bg-white dark:bg-black  flex items-center justify-center">
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
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 bg-white dark:bg-black text-gray-900 dark:text-white p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-30 w-35 border z-30 border   space-grotesk text-xs">
                    Creative Learning
                  </div>
                </div>
              </div>

              {/* Research Icon */}
              <div className="absolute bottom-10 left-8 md:right-8 group pointer-events-auto">
                <div className="relative">
                  <div className="rounded-full h-12 w-12 md:h-15 md:w-15 shadow-lg transform group-hover:scale-110 transition-all duration-300 cursor-pointer animate-float z-20 bg-white dark:bg-black flex items-center justify-center">
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
                  <div className="absolute top-1/2 left-20 transform -translate-y-1/2 mr-3 bg-white dark:bg-black text-gray-900 dark:text-white p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity w-fit duration-300 z-30 border  space-grotesk text-xs">
                    Collaborative research
                  </div>
                </div>
              </div>
            </div>
          </div>
          <section className="text-center flex items-center justify-center flex-col gap-2 relative">
            {/* <img className='absolute top-0 -right-10 h-1/2 rotate-60 w-full z-[-1] rounded-full h-' src="/bolt.png" alt="" /> */}

            <h1 className="bai-jamjuree-semibold text-3xl md:text-4xl lg:text-6xl  text-center ">
              The collaborative,{" "}
              <span className="cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-sky-600">
                Community-powered
              </span>{" "}
              knowledge agent—customized for you
            </h1>
            <h2 className="space-grotesk text-xs md:text-sm text-center  text-gray-800 dark:text-gray-300">
              Access verified, community-contributed, and authentic information.
              Perform deep research on private documents or create collaborative
              AI rooms to analyze data together.
            </h2>
            <motion.button
              whileHover={{ scale: 1.05, transform: "translateX(50px)" }}
              transition={{ duration: 0.6, ease: "circInOut" }}
              whileTap={{ scale: 1.09, transform: "translateX(40px)" }}
            >
              <Link
                to="/Interface"
                className={` px-3 py-2  overflow-x-hidden  rounded-lg dark:bg-white  dark:text-black bg-black text-white  bai-jamjuree-semibold flex items-center justify-center gap-2 mt-10 CustPoint     transition-all duration-500 `}
              >
                Try for free
                <ul>
                  <BsLightningChargeFill />
                </ul>
              </Link>
            </motion.button>
          </section>
        </div>
      </div>
      <Why />
      <Testimonials />
      {/* <Tutorial /> */}
      <Pricing />
      <Marquee />
      <Footer />
    </>
  );
};

export default LandingPage;
