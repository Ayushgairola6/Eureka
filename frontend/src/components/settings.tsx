import React from "react";
import { IoMoonOutline } from "react-icons/io5";
import { BiUserPlus } from "react-icons/bi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleTheme } from "../store/AuthSlice";
import { Link } from "react-router";
import { BsSun } from "react-icons/bs";
import { GoArrowUpRight } from "react-icons/go";
type settingProps = {
  showSettings: boolean;
  isLoggedIn: boolean;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
};

const Settings: React.FC<settingProps> = (
  {

  }
) => {
  const { isDarkMode, isLoggedIn, user } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useAppDispatch();

  return (
    <>
      <div className="hidden md:flex items-center justify-center gap-6">
        {/* THEME TOGGLE: Minimalist & Tactile */}
        {/* Removed the background circle. It's now just a sharp, clean icon interaction. */}
        <button
          className="text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer"
          onClick={() => dispatch(toggleTheme())}
        >
          {isDarkMode ? <BsSun size={20} /> : <IoMoonOutline size={20} />}
        </button>

        {/* AUTH ACTIONS */}
        {isLoggedIn === false && (!user?.email || user.email === "") && (
          <div className="flex items-center gap-6">
            {/* LOGIN: The "Phantom" Link */}
            {/* Uppercase + Tracking makes it look industrial/technical. */}
            <Link to="/Login">
              <button
                className="group flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300 
                           hover:text-black dark:hover:text-white transition-colors duration-300 space-grotesk cursor-pointer"
              >
                Login
                <GoArrowUpRight className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </button>
            </Link>

            {/* SIGNUP: The "Precision" Button */}
            {/* Sharp corners (rounded-sm), thin border, subtle background. */}
            <Link to="/Register">
              <button
                className="relative group overflow-hidden border border-gray-900/10 dark:border-white/20 
                           rounded-sm bg-transparent hover:border-emerald-500 dark:hover:border-emerald-400 
                           transition-colors duration-300"
              >
                {/* Button Content */}
                <div className="relative  px-5 py-1.5 bg-transparent group-hover:bg-emerald-500/5 dark:group-hover:bg-emerald-400/10 transition-colors duration-300 cursor-pointer flex items-center justify-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-black dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 space-grotesk transition-colors">
                    Signup
                  </span>
                  <BiUserPlus />
                </div>

                {/* Optional: Tiny tech accent (a glowing corner or line) */}
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-emerald-500 transition-all duration-300 group-hover:w-full"></div>
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default Settings;
