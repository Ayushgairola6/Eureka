import React from "react";
import { IoBulbOutline, IoMoonOutline, IoLogInSharp } from "react-icons/io5";
import { BiUserPlus, BiLogOut, BiLoaderAlt } from "react-icons/bi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { LogoutUser, toggleTheme } from "../store/AuthSlice";
import { Link } from "react-router";
import { TbDashboard } from "react-icons/tb";
type settingProps = {
  showSettings: boolean;
  isLoggedIn: boolean;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
};

const Settings: React.FC<settingProps> = ({
  showSettings,
  setShowSettings,
  isLoggedIn,
}) => {
  const { isDarkMode, isLoggingOut } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  return (
    <>
      <div
        onClick={(e) => {
          // Stop event propagation to prevent the menu from closing immediately
          // when a list item is clicked.
          e.stopPropagation();
          setShowSettings(!showSettings);
        }}
        className={`${
          showSettings
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        } dark:bg-black bg-white text-black dark:text-white border border-gray-300 absolute right-8 top-12
       transition-all duration-300 bai-jamjuree-semibold z-50 rounded-sm shadow-lg hidden md:block`}
      >
        <div className="flex flex-col ">
          {/* Themed Toggle */}
          <ul
            onClick={(e) => {
              e.stopPropagation(); // Prevent the parent div's onClick
              dispatch(toggleTheme());
            }}
            className="cursor-pointer px-4 py-1 flex items-center justify-between gap-3 hover:dark:bg-gray-400 hover:bg-gray-600 hover:text-white  rounded-sm transition-colors"
          >
            {isDarkMode ? (
              <>
                <span className="flex-grow">Light Mode</span>
                <IoBulbOutline size={18} />
              </>
            ) : (
              <>
                <span className="flex-grow">Dark Mode</span>
                <IoMoonOutline size={18} />
              </>
            )}
          </ul>

          {/* User-specific links (Login, Register, Logout) */}
          <hr className="border-gray-400" />
          {isLoggedIn ? (
            <>
              <Link to="/user/dashboard" onClick={() => setShowSettings(false)}>
                <ul className="cursor-pointer px-4 py-1 flex items-center justify-between gap-3 hover:dark:bg-gray-400 hover:bg-gray-600 hover:text-white  rounded-sm transition-colors">
                  <span className="flex-grow">Dashboard</span>
                  <TbDashboard size={18} />
                </ul>
              </Link>
              <ul
                onClick={() => {
                  // dispatch(logout()); // Assuming you have a logout action
                  setShowSettings(false);
                }}
                className="cursor-pointer px-4 py-1 flex items-center justify-between gap-3 hover:bg-gray-400  rounded-md hover:text-white transition-colors"
              >
                <button
                  onClick={() => dispatch(LogoutUser())}
                  className="flex-grow"
                >
                  {isLoggingOut === true ? "wait" : "Logout"}
                </button>
                {isLoggingOut === false ? (
                  <BiLogOut size={18} />
                ) : (
                  <BiLoaderAlt />
                )}
              </ul>
            </>
          ) : (
            <>
              <Link to="/Login" onClick={() => setShowSettings(false)}>
                <ul className="cursor-pointer px-4 py-1 flex items-center justify-between gap-3 hover:bg-gray-700 rounded-sm hover:text-white  transition-colors">
                  <span className="flex-grow">Login</span>
                  <IoLogInSharp size={18} />
                </ul>
              </Link>
              <Link to="/Register" onClick={() => setShowSettings(false)}>
                <ul className="cursor-pointer px-4 py-1 flex items-center justify-between gap-3 hover:bg-gray-700 hover:text-white   rounded-sm transition-colors">
                  <span className="flex-grow">Register</span>
                  <BiUserPlus size={18} />
                </ul>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Settings;
