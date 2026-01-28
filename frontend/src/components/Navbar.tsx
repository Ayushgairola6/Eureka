import { useState } from "react";
import { BiMenuAltRight, BiSun } from "react-icons/bi";
import { IoIosNotificationsOutline } from "react-icons/io";
import { Link } from "react-router";
import Sidebar from "@/components/Sidebar";
import { MdClose } from "react-icons/md";
// import { motion, useScroll } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../store/hooks.tsx";
import { setCurrTab, toggleTheme } from "../store/AuthSlice.ts";
import { setOpen } from "../store/chatRoomSlice.ts";
import NotificationPanel from "@/components/notificationBar.tsx";
import Settings from "@/components/settings.tsx";
import { GoMoon } from "react-icons/go";
import { CustomDropdown } from "./Theme_Picker.tsx";
import { LogoRender } from "./LogoRender.tsx";
const Navbar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dispatch = useAppDispatch();
  // const { scrollYProgress } = useScroll();
  // const notificationcount = useAppSelector(
  //   (state) => state.auth.notificationcount
  // );
  const { isLoggedIn, isDarkMode, user, notificationcount, currTab } =
    useAppSelector((state) => state.auth);
  const { isOpen } = useAppSelector((state) => state.chats);
  const { CurrentTheme } = useAppSelector((s) => s.interface);
  // const {isOpen} = useAppSelector(state=>state.chats)
  // const { currTab } = useAppSelector((state) => state.auth);

  const navLinks = [
    { label: "Home", to: "/", tab: "Home" },
    { label: "Try Now", to: "/Interface", tab: "Try" },
    { label: "Rooms", to: "/user/rooms", tab: "Rooms" },
    { label: "History", to: "/user/misallaneous-chats", tab: "History" },
    { label: "User Manual", to: "/userManual/AntiNode/Know-How", tab: "User manual" },
    { label: "Feedback", to: "/Feedback", tab: "Feedback" },
    // only show dashboard when logged in
    {
      label: "DashBoard",
      to: "/user/dashboard",
      tab: "DashBoard",
      requiresAuth: true,
    },
  ];

  return (
    <>
      <nav
        className={`sticky top-0 left-0 bg-white text-black dark:bg-black dark:text-white border  py-1 px-6 flex items-center justify-between z-[3] oveflow-visible `}
      >
        {/* top scroll indicator
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="bg-orange-500 w-full fixed py-0.5 origin-left top-0 left-0 z-[9]"
        ></motion.div> */}

        {/* navlinks */}
        <Link
          to="/"
          className="  text-md  w-fit flex items-center justify-center bai-jamjuree-bold rounded-md  cursor-pointer  p-1"
        >
          {/* <img
            className="h-4 w-4  rounded-xs   "
            src={isDarkMode === true ? "/Dark.png" : "/Light.png"}
            alt="logo"
          /> */}
          <LogoRender />
        </Link>

        <div
          className={`relative hidden md:flex items-center justify-center gap-3 text-sm space-grotesk dark:text-white text-black `}
        >
          {navLinks.map((link) => {
            if (link.requiresAuth && !isLoggedIn) return null;
            const isActive = currTab === link.tab;
            return (
              <Link
                key={link.tab}
                onClick={() => dispatch(setCurrTab(link.tab))}
                className={`rounded-lg py-1 px-2 dark:hover:bg-white hover:bg-black hover:text-white dark:hover:text-black transition-all duration-300 ${isActive ? "slider" : "bg-transparent"
                  }`}
                to={link.to}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-2 bai-jamjuree-regular text-sm overflow-visible ">
          {/* settings icon */}
          <ul className="hidden md:block border rounded-sm">
            <CustomDropdown />
          </ul>

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
              <ul
                className={`${CurrentTheme.user} cursor-pointer uppercase  rounded-full h-7 w-7  text-lg p-2 flex items-center justify-center   bai-jamjuree-semibold  `}
              >
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
        <NotificationPanel />
      </nav>
      <Sidebar isVisble={isVisible} setIsVisible={setIsVisible} />
    </>
  );
};

export default Navbar;
