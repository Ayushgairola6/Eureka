import { Link } from "react-router";
import { IoHomeOutline } from "react-icons/io5";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import { MdDashboard, MdFeedback, MdLogin } from "react-icons/md";
import { FaRegRegistered } from "react-icons/fa";
import { MdKey } from "react-icons/md";
import { useAppSelector } from "../store/hooks.tsx";
type SidebarProps = {
  isVisble: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
};
//  = useAppSelector(state => state.auth.isLoggedIn);
const Sidebar: React.FC<SidebarProps> = ({ isVisble, setIsVisible }) => {
  const { isLoggedIn } = useAppSelector((state) => state.auth);

  return (
    <>
      <div
        onClick={() => {
          if (isVisble === true) {
            setIsVisible(false);
          }
          // -translate-y-0 translate-y-90
        }}
        className={`md:hidden fixed h-auto w-70 -bottom-5 -left-2 rotate-0 bg-white dark:bg-black  rounded-r-full shadow-2xl shadow-black dark:shadow-purple-500 gap-2 z-[99] py-10 rounded-b-xl  ${
          isVisble === true
            ? "-translate-y-0 rotate-0"
            : "translate-y-90  rotate-90"
        } duration-500 transition-all cursor-pointer flex items-center justify-start border border-black dark:border-white/40`}
      >
        {/* <MdClose size={22} className="absolute right-5 bottom-8 hover:scale-110 transition-all duration-300" /> */}

        {/*navigation links  */}
        <motion.section className="flex flex-col items-center justify-center gap-1   text-sm space-grotesk">
          <Link
            className=" w-full py-2 flex items-center justify-start gap-6 hover:text-purple-600   pl-4 hover:pl-12 hover:transition-all duration-300"
            to="/"
          >
            <IoHomeOutline size={22} />
            Home
          </Link>
          <Link
            className=" w-full py-2 flex items-center justify-start gap-6 hover:text-purple-600   pl-4 hover:pl-12 hover:transition-all duration-300"
            to="/Interface"
          >
            <IoChatboxEllipsesOutline size={22} />
            Try Now
          </Link>
          {isLoggedIn === false && (
            <Link
              className=" w-full py-2 flex items-center justify-start gap-6 hover:text-purple-600   pl-4 hover:pl-12 hover:transition-all duration-300"
              to="/Register"
            >
              <FaRegRegistered size={22} />
              Register
            </Link>
          )}
          {isLoggedIn === false ? (
            <Link
              className=" w-full py-2 flex items-center justify-start gap-6 hover:text-purple-600   pl-4 hover:pl-12 hover:transition-all duration-300"
              to="/Login"
            >
              <MdLogin size={22} />
              Login
            </Link>
          ) : (
            <Link
              className=" w-full py-2 flex items-center justify-start gap-6 hover:text-purple-600   pl-4 hover:pl-12 hover:transition-all duration-300"
              to="user/dashboard"
            >
              <MdDashboard size={22} />
              Dashboard
            </Link>
          )}

          <Link
            className=" w-full py-2 flex items-center justify-start gap-6 hover:text-purple-600   pl-4 hover:pl-12 hover:transition-all duration-300"
            to="/Feedback"
          >
            <MdFeedback size={22} />
            Feedback
          </Link>
          <Link
            className=" w-full py-2 flex items-center justify-start gap-6 hover:text-purple-600   pl-4 hover:pl-12 hover:transition-all duration-300"
            to="/Api/introduction"
          >
            <MdKey size={22} />
            API{" "}
          </Link>
          {/* <Link
            className=" w-full py-2 flex items-center justify-start gap-6 hover:text-purple-600   pl-4 hover:pl-12 hover:transition-all duration-300"
            to="/About"
          >
            <GoQuestion size={22} />
            Quick Start
          </Link> */}
        </motion.section>
      </div>
    </>
  );
};

export default Sidebar;
