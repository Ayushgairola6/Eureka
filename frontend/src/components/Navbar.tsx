import { useState } from "react";
import { BiMenuAltRight, BiSun } from "react-icons/bi";
import { IoIosNotificationsOutline } from "react-icons/io";
import { Link } from "react-router";
import Sidebar from "@/components/Sidebar";
import { MdClose } from "react-icons/md";
import { motion, useScroll } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../store/hooks.tsx";
import { setCurrTab, toggleTheme } from "../store/AuthSlice.ts";
import { setOpen } from "../store/chatRoomSlice.ts";
import NotificationPanel from "@/components/notificationBar.tsx";
import Settings from "@/components/settings.tsx";
import { IoIosArrowDropdown } from "react-icons/io";
import { GoMoon } from "react-icons/go";
const Navbar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dispatch = useAppDispatch();
  const { scrollYProgress } = useScroll();
  const notificationcount = useAppSelector(
    (state) => state.auth.notificationcount
  );
  const { isLoggedIn, isDarkMode, user } = useAppSelector(
    (state) => state.auth
  );
  // const {isOpen} = useAppSelector(state=>state.chats)
  const { currTab } = useAppSelector((state) => state.auth);

  return (
    <>
      <nav
        className={`sticky top-0 left-0 bg-gray-50 border  py-1 px-6 flex items-center justify-between z-[3] oveflow-visible dark:text-white text-black dark:bg-black `}
      >
        {/* top scroll indicator */}
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="bg-orange-500 w-full fixed py-0.5 origin-left top-0 left-0 z-[9]"
        ></motion.div>

        {/* navlinks */}
        <Link
          to="/"
          className="cursor-pointer flex items-center justify-center gap-2 "
        >
          {/* EUREKA */}

          {/* <span className="bebas-neue-regular text-xl">Ask?EUREKA</span> */}

          <img
            className="h-12 w-12 rotate-9 "
            src={isDarkMode === false ? "/Light.png" : "/Dark.png"}
            alt="AskEuekaLogo"
          />
        </Link>

        <div
          className={`relative hidden md:flex items-center justify-center gap-3 text-sm space-grotesk dark:text-white text-black `}
        >
          <Link
            onClick={() => dispatch(setCurrTab("Home"))}
            className={` rounded-lg py-1 px-2 dark:hover:bg-white hover:bg-black hover:text-white dark:hover:text-black    transition-all duration-300 ${
              currTab === "Home" ? " slider" : " "
            } z-[1]`}
            to="/"
          >
            Home
          </Link>
          <Link
            onClick={() => dispatch(setCurrTab("Try"))}
            className={` rounded-lg py-1 px-2 dark:hover:bg-white hover:bg-black hover:text-white dark:hover:text-black    transition-all duration-300 ${
              currTab === "Try" ? "slider" : "bg-transparent "
            }`}
            to="/Interface"
          >
            Try Now
          </Link>

          {/* <Link
            onClick={() => dispatch(setCurrTab("About"))}
            className={` rounded-lg py-1 px-2 hover:bg-indigo-300 transition-all duration-300 ${
              currTab === "About" ? "slider" : "bg-transparent "
            }`}
            to="/About"
          >
            Quick start
          </Link> */}

          <Link
            onClick={() => dispatch(setCurrTab("API"))}
            className={` rounded-lg py-1 px-2 dark:hover:bg-white hover:bg-black hover:text-white dark:hover:text-black    transition-all duration-300 ${
              currTab === "API" ? "slider" : "bg-transparent "
            }`}
            to="/Api/introduction"
          >
            API
          </Link>
          <Link
            onClick={() => dispatch(setCurrTab("Feedback"))}
            className={` rounded-lg py-1 px-2 dark:hover:bg-white hover:bg-black hover:text-white dark:hover:text-black    transition-all duration-300 ${
              currTab === "Feedback" ? "slider" : "bg-transparent "
            }`}
            to="/Feedback"
          >
            Feedback
          </Link>
          {/* only render if the user is not logged In */}
          {isLoggedIn === true && (
            <Link
              onClick={() => dispatch(setCurrTab("DashBoard"))}
              className={` rounded-lg py-1 px-2 dark:hover:bg-white hover:bg-black hover:text-white dark:hover:text-black    transition-all duration-300 ${
                currTab === "DashBoard" ? "slider" : "bg-transparent "
              }`}
              to="/user/dashboard"
            >
              DashBoard
            </Link>
          )}

          {/* end */}
        </div>

        <div className="flex items-center justify-center gap-2 bai-jamjuree-regular text-sm overflow-visible ">
          {/* settings icon */}
          <div className="relative  group">
            <button
              className={`cursor-pointer md:block hidden p-1  ${
                showSettings
                  ? "text-red-600 bg-red-100 dark:bg-red-900/30"
                  : "text-green-500 bg-green-600/10 "
              } rounded-full transition-all duration-300 hover:scale-110`}
              onClick={() => setShowSettings(!showSettings)}
            >
              <IoIosArrowDropdown
                size={22}
                className={`transition-transform duration-300 ${
                  showSettings ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {/* Tooltip */}
            {showSettings === false && (
              <div className="absolute  top-7 right-4  z-[9999]   hidden md:flex px-2 py-1 bg-black dark:bg-white text-white dark:text-black border  text-xs rounded pointer-events-none  opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Options
                <div className="absolute -top-1 right-2 transform -translate-x-1/2 w-2 h-2 bg-black dark:bg-white rotate-45"></div>
              </div>
            )}
            <Settings
              showSettings={showSettings}
              setShowSettings={setShowSettings}
              isLoggedIn={isLoggedIn}
            />
          </div>

          {/* notificaiton icon */}
          {user.username !== "" && (
            <ul
              onClick={() => dispatch(setOpen(true))}
              className="cursor-pointer  rounded-full p-1 relative "
            >
              <IoIosNotificationsOutline size={22} />
              <span className=" absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-medium text-white bg-red-600 rounded-full border-2 border-white dark:border-gray-900">
                {notificationcount}
              </span>
              <NotificationPanel />
            </ul>
          )}
          {/* small screen theme icon */}
          <ul
            onClick={() => {
              dispatch(toggleTheme());
            }}
            className="cursor-pointer p-1 md:hidden block"
          >
            {isDarkMode ? (
              <>
                <BiSun size={22} />
              </>
            ) : (
              <>
                <GoMoon size={22} />
              </>
            )}
          </ul>

          {/* rest of the items */}
          {user.username !== "" && (
            <Link to="user/dashboard">
              {" "}
              <ul className="cursor-pointer uppercase bg-emerald-500 rounded-full h-6 w-6  text-lg p-1 flex items-center justify-center  text-white bai-jamjuree-regular  font-bold">
                {user?.username.trim().split("_")[0].charAt(0).toUpperCase()}
              </ul>
            </Link>
          )}
          {isVisible === false ? (
            <BiMenuAltRight
              onClick={() => setIsVisible(!isVisible)}
              className="md:hidden block cursor-pointer "
              size={28}
            />
          ) : (
            <MdClose
              onClick={() => setIsVisible(!isVisible)}
              className="md:hidden block  cursor-pointer"
              size={28}
            />
          )}
        </div>
      </nav>
      <Sidebar isVisble={isVisible} setIsVisible={setIsVisible} />
    </>
  );
};

export default Navbar;
