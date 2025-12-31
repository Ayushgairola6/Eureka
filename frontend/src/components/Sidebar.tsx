import { Link } from "react-router";
import { IoHomeOutline } from "react-icons/io5";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { MdDashboard, MdFeedback, MdLogin } from "react-icons/md";
import { FaRegRegistered } from "react-icons/fa";
import { MdKey } from "react-icons/md";
import { useAppSelector } from "../store/hooks.tsx";
import { BsPeople } from "react-icons/bs";
import { motion } from "framer-motion";
type SidebarProps = {
  isVisble: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
};
//  = useAppSelector(state => state.auth.isLoggedIn);
const Sidebar: React.FC<SidebarProps> = ({ isVisble, setIsVisible }) => {
  const { isLoggedIn, user } = useAppSelector((state) => state.auth);

  return (
    <>
      <motion.div
        initial={{ x: -400 }}
        animate={{
          x: isVisble === true ? 0 : -500,
        }}
        transition={{ duration: 0.3, ease: "backInOut" }}
        onClick={() => {
          if (isVisble === true) {
            setIsVisible(false);
          }

          // -translate-y-0 translate-y-90
        }}
        className={`md:hidden fixed h-full w-70  top-0 rotate-0 bg-white dark:bg-black dark:text-white text-black  z-[20] rounded-tr-md pt-10 rounded-br-md   duration-500 transition-all cursor-pointer flex flex-col items-center justify-start border border-gray-300 dark:border-gray-700`}
      >
        {/* logo  */}
        <header className="absolute uppercase  top-2 right-2 text-xs  w-full flex items-center justify-end  bai-jamjuree-bold rounded-md border p-1">
          {/* <img
            className="h-4 w-4  rounded-xs  "
            src={isDarkMode === true ? "/Dark.png" : "/Light.png"}
            alt="logo"
          /> */}

          <label htmlFor="logo">AntiNode</label>
        </header>
        {/* HeaderSection */}
        <div className="border-b w-full px-3 py-3">
          <section className="space-y-3">
            <h1 className="bai-jamjuree-semibold flex items-center justify-start gap-3">
              <Link
                className="p-1 flex items-center justify-center h-6 w-6 rounded-full dark:bg-white dark:text-black bg-black text-white space-grotesk font-semibold"
                role="button"
                to="/user/dashboard"
              >
                {user?.username.trim().split("")[0]}
              </Link>
              {user?.username || "Cadet"}
            </h1>
            <h2 className="bai-jamjuree-regular text-xs text-gray-400">
              {user?.email || "Cadet@unknown.com"}
            </h2>
          </section>
        </div>
        {/*navigation links  */}
        <section className="grid grid-cols-1 space-y-2  w-full mt-8  text-sm space-grotesk realative">
          {/* <ul className="py-2 pl-4 "> <CustomDropdown /> */}
          {/* </ul> */}
          <Link
            className=" w-full py-2 flex items-center justify-start gap-6 hover:bg-white/10 pl-4   hover:pl-12 hover:transition-all duration-300"
            to="/"
          >
            <IoHomeOutline size={22} />
            Home
          </Link>
          <Link
            className=" w-full py-2 flex items-center justify-start gap-6 hover:bg-white/10   pl-4 hover:pl-12 hover:transition-all duration-300"
            to="/Interface"
          >
            <IoChatboxEllipsesOutline size={22} />
            Try Now
          </Link>
          <Link
            className=" w-full py-2 flex items-center justify-start gap-6 hover:bg-white/10   pl-4 hover:pl-12 hover:transition-all duration-300"
            to="/user/rooms"
          >
            <BsPeople size={22} />
            Rooms
          </Link>
          {isLoggedIn === false && user?.email === "" && (
            <Link
              className=" w-full py-2 flex items-center justify-start gap-6 hover:bg-white/10   pl-4 hover:pl-12 hover:transition-all duration-300"
              to="/Register"
            >
              <FaRegRegistered size={22} />
              Register
            </Link>
          )}
          {isLoggedIn === false && user?.email === "" ? (
            <Link
              className=" w-full py-2 flex items-center justify-start gap-6 hover:bg-white/10   pl-4 hover:pl-12 hover:transition-all duration-300"
              to="/Login"
            >
              <MdLogin size={22} />
              Login
            </Link>
          ) : (
            <Link
              className=" w-full py-2 flex items-center justify-start gap-6 hover:bg-white/10   pl-4 hover:pl-12 hover:transition-all duration-300"
              to="user/dashboard"
            >
              <MdDashboard size={22} />
              Dashboard
            </Link>
          )}
          <Link
            className=" w-full py-2 flex items-center justify-start gap-6 hover:bg-white/10   pl-4 hover:pl-12 hover:transition-all duration-300"
            to="/Feedback"
          >
            <MdFeedback size={22} />
            Feedback
          </Link>
          <Link
            className=" w-full py-2 flex items-center justify-start gap-6 hover:bg-white/10   pl-4 hover:pl-12 hover:transition-all duration-300"
            to="/Api/introduction"
          >
            <MdKey size={22} />
            API{" "}
          </Link>
        </section>
      </motion.div>
    </>
  );
};

export default Sidebar;
