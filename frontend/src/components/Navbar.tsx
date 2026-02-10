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
import { LogoRender } from "./LogoRender.tsx";
const Navbar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dispatch = useAppDispatch();

  const { isLoggedIn, isDarkMode, user, notificationcount, currTab } =
    useAppSelector((state) => state.auth);
  const { isOpen } = useAppSelector((state) => state.chats);

  const navLinks = [
    { label: "Overview", to: "/", tab: "Overview" },
    { label: "Console", to: "/Interface", tab: "Console" },
    { label: "Documentation", to: "/userManual/AntiNode/Know-How", tab: "Documentation" },
    // only show dashboard when logged in
    {
      label: "Control Center",
      to: "/user/dashboard",
      tab: "Control Center",
      requiresAuth: true,
    },
    { label: "Workspace", to: "/user/rooms", tab: "Workspace" },
    { label: "Archives", to: "/user/misallaneous-chats", tab: "Archives" },
    { label: "Support", to: "/Feedback", tab: "Support" },

  ];

  return (
    <>
      <nav

        className={`sticky top-0 left-0 bg-white text-black dark:bg-black dark:text-white border  py-1 px-6 flex items-center justify-between z-[3] oveflow-visible `}
      >

        <Link
          to="/"
          className="  text-md  w-fit flex items-center justify-center bai-jamjuree-bold rounded-md  cursor-pointer  p-1"
        >

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
                className={`rounded-lg py-1 px-2   transition-all duration-300 ${isActive ? "dark:bg-white bg-black text-white dark:text-black" : "bg-none text-black dark:text-white"
                  }`}
                to={link.to}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-2 bai-jamjuree-regular text-sm overflow-visible ">


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
                className={`bg-neutral-900 dark:bg-white text-white dark:text-black cursor-pointer uppercase   h-5 w-5  text-md p-2 flex items-center justify-center   bai-jamjuree-regular  `}
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
