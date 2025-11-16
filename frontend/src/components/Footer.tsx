import {
  FiGithub,
  FiTwitter,
  FiYoutube,
  FiLink2,
  FiBookOpen,
} from "react-icons/fi";
import { Link } from "react-router";

const Footer = () => {
  return (
    <>
      <footer
        className={`"relative dark:bg-black dark:text-white  border-t border-gray-200 overflow-hidden z-[1]"`}
      >
        {/* Gradient background elements */}
        <div className="z-[-1] absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sky-600/20 to-red-600/20 blur-3xl "></div>

        <div className="max-w-7xl mx-auto px-6 py-16 relative ">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand column */}
            <div className="space-y-6 ">
              <div className="flex items-center">
                <span className="text-2xl bai-jamjuree-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  EUREKA
                </span>
              </div>
              <p
                className={`space-grotesk dark:text-gray-300 text-gray-600  text-sm`}
              >
                The open-source knowledge engine powered by AI and community
                wisdom.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-500 p-2 dark:text-black bg-gray-200 rounded-full hover:text-purple-600 transition-colors"
                >
                  <FiGithub className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-500 p-2 dark:text-black bg-gray-200 rounded-full hover:text-blue-600 transition-colors"
                >
                  <FiTwitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-500 p-2 dark:text-black bg-gray-200 rounded-full hover:text-red-600 transition-colors"
                >
                  <FiYoutube className="w-5 h-5" />
                </a>
              </div>
            </div>

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

          {/* Bottom footer */}
          <div className="border-t border-gray-200 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="bai-jamjuree-semibold dark:text-gray-300 text-gray-500 text-sm  ">
              © {new Date().getFullYear()} AskEureka. Knowledge for all.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
