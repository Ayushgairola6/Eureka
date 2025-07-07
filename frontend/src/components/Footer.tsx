import {
  FiGithub,
  FiTwitter,
  FiYoutube,
  FiLink2,
  FiBookOpen,
  FiMail,
  FiSend
} from 'react-icons/fi';
const Footer = () => {
  return (<>
    <footer className="relative bg-gray-50 border-t border-gray-200 overflow-hidden z-[1]">
      {/* Gradient background elements */}
      <div className="z-[0] absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-br from-indigo-600/10 to-blue-800/10 blur-2xl "></div>
      <div className="absolute top-1/2 right-0 w-32 h-32 rounded-full bg-purple-600/10 blur-3xl z-0"></div>

      <div className="max-w-7xl mx-auto px-6 py-16 relative ">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="space-y-6">
            <div className="flex items-center">
              <span className="text-2xl bai-jamjuree-bold bg-clip-text text-transparent bg-gradient-to-r from-black to-purple-600">
                EUREKA
              </span>
            </div>
            <p className="space-grotesk text-gray-600 text-sm">
              The open-source knowledge engine powered by AI and community wisdom.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-purple-600 transition-colors">
                <FiGithub className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                <FiTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-red-600 transition-colors">
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
              <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors text-sm">Public Demo</a></li>
              <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors text-sm">Documentation</a></li>
              <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors text-sm">Contribute</a></li>
              <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors text-sm">Self-Host Guide</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="bai-jamjuree-semibold text-lg mb-6 flex items-center gap-2">
              <FiBookOpen className="text-blue-600" />
              Resources
            </h3>
            <ul className="space-y-3 space-grotesk">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">API Reference</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Tutorials</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Community</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Blog</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="bai-jamjuree-semibold text-lg mb-6 flex items-center gap-2">
              <FiMail className="text-amber-600" />
              Stay Updated
            </h3>
            <p className="space-grotesk text-gray-600 text-sm mb-4">
              Join our newsletter for product updates and knowledge-sharing tips.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 text-sm space-grotesk border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
              />
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-r-lg text-sm bai-jamjuree-medium hover:opacity-90 transition-opacity">
                <FiSend />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="border-t border-gray-200 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="space-grotesk text-gray-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Eureka. Open-source knowledge for all.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="space-grotesk text-gray-500 hover:text-purple-600 text-sm transition-colors">Terms</a>
            <a href="#" className="space-grotesk text-gray-500 hover:text-purple-600 text-sm transition-colors">Privacy</a>
            <a href="#" className="space-grotesk text-gray-500 hover:text-purple-600 text-sm transition-colors">Cookies</a>
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute bottom-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-purple-500/10"
            style={{
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              bottom: `${Math.random() * 30}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 15 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
    </footer>
  </>)
}

export default Footer;