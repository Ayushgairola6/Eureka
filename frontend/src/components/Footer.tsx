import {
  FiGithub,
  FiTwitter,
  FiYoutube,
  FiLink2,
  FiBookOpen,
} from "react-icons/fi";
import { Link } from "react-router";
import { useAppSelector } from "../store/hooks";
const Footer = () => {
  const { isDarkMode } = useAppSelector((state) => state.auth);
  return (
    <>
      <footer
        className={`relative dark:bg-black dark:text-white  border-t border-gray-400 overflow-hidden z-[1]`}
      >
        <div className=" px-6 py-5 relative ">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-2 py-6 w-full">
            {/* Brand column */}
            <div className="space-y-6 ">
              <Link
                to="/"
                className="  text-md  w-fit flex items-center justify-center gap-1 bai-jamjuree-bold rounded-md  cursor-pointer  p-1"
              >
                <img
                  className="h-10 w-10  rounded-md   "
                  src={isDarkMode === true ? "/Dark.png" : "/Light.png"}
                  alt="logo"
                />
                <label htmlFor="logo">AskEureka</label>
              </Link>
              <p
                className={`space-grotesk dark:text-gray-300 text-gray-600  text-sm`}
              >
                The open-source knowledge engine powered by AI and community
                wisdom.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://github/com/Ayushgairola6/EurekaSdk"
                  className="text-gray-500 p-2 dark:text-black bg-gray-200 rounded-full hover:text-purple-600 transition-colors"
                >
                  <FiGithub className="w-5 h-5" />
                </a>
                <a
                  href="https://X.com/askeureka"
                  className="text-gray-500 p-2 dark:text-black bg-gray-200 rounded-full hover:text-blue-600 transition-colors"
                >
                  <FiTwitter className="w-5 h-5" />
                </a>
                <a
                  href="https://youtube.com/AskEureka"
                  className="text-gray-500 p-2 dark:text-black bg-gray-200 rounded-full hover:text-red-600 transition-colors"
                >
                  <FiYoutube className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between w-full">
              {/* Quick Links */}
              <div>
                <h3 className="bai-jamjuree-semibold text-lg mb-6 flex items-center gap-2">
                  <FiLink2 className="text-purple-600" />
                  Quick Links
                </h3>
                <ul className="space-y-3 space-grotesk">
                  <li>
                    <Link
                      to="#"
                      className="dark:text-gray-300 text-gray-600 dark:hover:text-indigo-400 hover:text-purple-600 transition-colors text-sm"
                    >
                      Public Demo
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/Api/AskEureka/Know-How"
                      className="dark:text-gray-300 text-gray-600 dark:hover:text-indigo-400 hover:text-purple-600 transition-colors text-sm"
                    >
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contribution/sdk"
                      className="dark:text-gray-300 text-gray-600 dark:hover:text-indigo-400 hover:text-purple-600 transition-colors text-sm"
                    >
                      Contribute
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/feedback"
                      className="dark:text-gray-300 text-gray-600 dark:hover:text-indigo-400 hover:text-purple-600 transition-colors text-sm"
                    >
                      Get in touch
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="bai-jamjuree-semibold text-lg mb-6 flex items-center gap-2">
                  <FiBookOpen className="text-blue-600" />
                  Resources
                </h3>
                <ul className="space-y-3 space-grotesk">
                  <li>
                    <Link
                      to="/Api/introduction"
                      className="dark:text-gray-300 text-gray-600 dark:hover:text-indigo-400 hover:text-blue-600 transition-colors text-sm"
                    >
                      API Reference
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/Privacy"
                      className="dark:text-gray-300 text-gray-600 dark:hover:text-indigo-400 hover:text-blue-600 transition-colors text-sm"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/Refund-Policy"
                      className="dark:text-gray-300 text-gray-600 dark:hover:text-indigo-400 hover:text-blue-600 transition-colors text-sm"
                    >
                      Refund Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/terms-and-conditions"
                      className="dark:text-gray-300 text-gray-600 dark:hover:text-indigo-400 hover:text-blue-600 transition-colors text-sm"
                    >
                      Terms and conditions
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-black py-2 px-3 rounded-sm border shadow-xl flex items-center justify-between gap-4 ">
            <input
              className="dark:text-white text-black space-grotesk text-xs md:text-sm  ring-0 focus-ring-0 py-2 px-1 w-4/5"
              placeholder="Your email address"
              type="text"
            />
            <button className="bg-black text-white dark:bg-white dark:text-black rounded-md bai-jamjuree-semibold text-xs md:text-sm">
              Confirm
            </button>
          </div>
          {/* Bottom footer */}
          <div className="w-full text-center border-t border-gray-400  py-3 flex   justify-center items-center">
            <p className="bai-jamjuree-semibold dark:text-gray-300 text-gray-500 text-sm  ">
              © {new Date().toDateString()} AskEureka. Knowledge for all.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
