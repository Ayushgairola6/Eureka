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
  const { isOpen } = useAppSelector((state) => state.chats);
  // const {isOpen} = useAppSelector(state=>state.chats)
  const { currTab } = useAppSelector((state) => state.auth);

  return (
    <>
      <nav
        className={`sticky top-0 left-0 bg-white border  py-1 px-6 flex items-center justify-between z-[3] oveflow-visible dark:text-white text-black dark:bg-black `}
      >
        {/* top scroll indicator */}
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="bg-orange-500 w-full fixed py-0.5 origin-left top-0 left-0 z-[9]"
        ></motion.div>

        {/* navlinks */}
        <Link
          to="/"
          className="  text-md  w-fit flex items-center justify-center gap-1 bai-jamjuree-bold rounded-md  cursor-pointer  p-1"
        >
          <img
            className="h-4 w-4  rounded-xs border rounded-lg "
            src={isDarkMode === true ? "/Dark.png" : "/Light.png"}
            alt="logo"
          />
          <label htmlFor="logo">AskEureka</label>
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

          <Link
            onClick={() => dispatch(setCurrTab("Rooms"))}
            className={` rounded-lg py-1 px-2 dark:hover:bg-white hover:bg-black hover:text-white dark:hover:text-black    transition-all duration-300 ${
              currTab === "Rooms" ? "slider" : "bg-transparent "
            }`}
            to="/user/rooms"
          >
            Rooms
          </Link>

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

          <Settings
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            isLoggedIn={isLoggedIn}
          />

          {/* notificaiton icon */}
          {user?.username !== "" && (
            <ul
              onClick={() => dispatch(setOpen(!isOpen))}
              className="cursor-pointer  rounded-full p-1 relative "
            >
              <IoIosNotificationsOutline size={22} />
              {notificationcount > 0 && (
                <span className=" absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-medium text-white bg-red-600 rounded-full border-2 border-white dark:border-gray-900">
                  {notificationcount}
                </span>
              )}
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
          {user?.username !== "" && (
            <Link to="user/dashboard">
              {" "}
              <ul className="cursor-pointer uppercase bg-sky-600 text-white rounded-full h-7 w-7  text-lg p-2 flex items-center justify-center   bai-jamjuree-semibold  ">
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
