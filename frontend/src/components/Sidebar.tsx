import { Link, useLocation } from "react-router";
import { IoHomeOutline } from "react-icons/io5";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { MdDashboard, MdFeedback, MdLogin } from "react-icons/md";
import { FaRegRegistered } from "react-icons/fa";
import { MdKey } from "react-icons/md";
import { useAppSelector, useAppDispatch } from "../store/hooks.tsx";
import { BsChatSquare, BsPeople } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { LogoRender } from "./LogoRender.tsx";
import { FiX } from "react-icons/fi";
import { setCurrTab } from '../store/AuthSlice.ts'
type SidebarProps = {
  isVisble: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const Sidebar: React.FC<SidebarProps> = ({ isVisble, setIsVisible }) => {
  const { isLoggedIn, user } = useAppSelector((state) => state.auth);
  const { CurrentTheme } = useAppSelector((state) => state.interface);
  const location = useLocation();
  const dispatch = useAppDispatch();

  const handleLinkClick = () => {
    if (isVisble) {
      setIsVisible(false);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    {
      path: "/",
      icon: IoHomeOutline,
      label: "Overview",
      tab: "Overview",
      show: true,
    },
    {
      path: "/Interface",
      icon: IoChatboxEllipsesOutline,
      label: "Console",
      tab: "Console",
      show: true,
    },
    {
      path: "/user/misallaneous-chats",
      icon: BsChatSquare,
      label: "Archives",
      tab: "Archives",
      show: isLoggedIn === true && user?.email !== "",
    },
    {
      path: "/user/rooms",
      icon: BsPeople,
      label: "Workspace",
      tab: "Workspace",

      show: isLoggedIn === true && user?.email !== "",
    },
    {
      path: "/Register",
      icon: FaRegRegistered,
      label: "Sign UP",
      tab: "Sign UP",

      show: !isLoggedIn && user?.email === "",
    },
    {
      path: "/Login",
      icon: MdLogin,
      label: "Sign In",
      tab: "Sign In",
      show: !isLoggedIn && user?.email === "",
    },
    {
      path: "/user/dashboard",
      icon: MdDashboard,
      label: "Control Center",
      tab: "Control Center",
      show: isLoggedIn === true || user?.email !== "",
    },
    {
      path: "/Feedback",
      icon: MdFeedback,
      label: "Support",
      tab: "Support",
      show: !isLoggedIn && user?.email === "",
    },
    {
      path: "/userManual/AntiNode/Know-How",
      icon: MdKey,
      label: "Documentation",
      tab: "Documentation",
      show: true,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isVisble && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[19]"
            onClick={() => setIsVisible(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -400 }}
        animate={{
          x: isVisble ? 0 : -500,
        }}
        transition={{ duration: 0.3, ease: "easeInOut", type: "spring", damping: 20 }}
        className="md:hidden fixed h-full w-[300px] top-0 bg-white dark:bg-neutral-950 dark:text-white text-black z-[20] shadow-2xl flex flex-col border-r border-gray-200 dark:border-neutral-800"
      >
        {/* Header */}
        <div className="relative p-4 border-b border-gray-200 dark:border-gray-800">
          {/* Close Button */}
          <motion.button
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiX size={20} className="text-gray-600 dark:text-gray-400" />
          </motion.button>

          {/* Logo */}
          <div className="mb-4">
            <LogoRender />
          </div>

          {/* User Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Link
                to="/user/dashboard"
                onClick={handleLinkClick}
                className={`p-2 flex items-center justify-center h-10 w-10 rounded-full ${CurrentTheme.user} space-grotesk font-semibold text-base shadow-md hover:shadow-lg transition-shadow`}
              >
                {user?.username?.trim().split("")[0] || "C"}
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className="bai-jamjuree-semibold text-base truncate">
                  {user?.username || "Cadet"}
                </h1>
                <h2 className="bai-jamjuree-regular text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || "Cadet@unknown.com"}
                </h2>
              </div>
            </div>
          </div>

        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {navLinks.map(
              (link) =>
                link.show && (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => {
                      handleLinkClick()
                      dispatch(setCurrTab(link.tab))

                    }}
                    className={`
                      group relative flex items-center gap-4 px-4 py-3 rounded-xs
                      text-sm space-grotesk font-medium transition-all duration-200
                      ${isActive(link.path)
                        ? "bg-neutral-900 text-white dark:bg-gray-100 dark:text-black "
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-900"
                      }
                    `}
                  >
                    {/* Active Indicator */}
                    {isActive(link.path) && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    {/* Icon */}
                    <link.icon
                      size={22}
                      className={`
                        transition-transform duration-200
                        ${isActive(link.path)
                          ? "scale-110"
                          : "group-hover:scale-110"
                        }
                      `}
                    />

                    {/* Label */}
                    <span>{link.label}</span>

                    {/* Hover Effect */}
                    {!isActive(link.path) && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={false}
                      />
                    )}
                  </Link>
                )
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
          <div className="text-xs text-center text-gray-500 dark:text-gray-400 space-grotesk">
            <p>© 2026 AntiNode</p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;