import { FiCheckCircle, FiLock, FiChevronDown } from "react-icons/fi";
import { useState } from "react";
import { toast, Toaster } from "sonner";
import { Link } from "react-router";
import { useAppSelector } from "../store/hooks.tsx";

import { MdScale, MdArrowForward } from "react-icons/md";
import { BiPurchaseTag } from "react-icons/bi";
const Pricing = () => {
  // const stripePromise = loadStripe('your-publishable-key-here');
  const isDarkMode = useAppSelector((state) => state.auth.isDarkMode);

  const faqs = [
    {
      id: 1,
      question: "Can I keep my documents private ?",
      answer:
        "Yes, you can choose visibility type of the document your document when uploading your files .",
    },
    {
      id: 2,
      question: "How can I access my personal documents",
      answer:
        "In the Query interface you can see an option to see all your private docs which you can simply choose by clicking them and start querying in micro second.",
    },
    {
      id: 3,
      question: "What features does the premium version offers ?",
      answer:
        "The premium version has all features from private secure personal documents , access to community contibuted knowledge and many upcoming features as a beta tester .",
    },
    {
      id: 4,
      question: "Can I cancel my subscription any time ?",
      answer:
        "Yes you can cancel your subscription only upto 20 hours of you taking the subscription.",
    },
    {
      id: 5,
      question: "What are the upcoming features ?",
      answer:
        "Upcoming features contains significant changes in how the ai responds and also access to other services and potential offline usage with APIs to access your docs and a plug and use features",
    },
  ];
  const [show, setShow] = useState<Number>(0);

  return (
    <>
      <div
        className={`relative py-20 px-4 sm:px-6 z-[1] overflow-hidden ${
          isDarkMode ? "bg-black text-white" : "bg-gray-50 text-black"
        }`}
      >
        {/* Gradient background elements */}
        {!isDarkMode && (
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sky-600/20 to-indigo-800/20 blur-3xl z-[-1]" />
        )}

        {/* Section header */}
        <div className="max-w-4xl mx-auto text-center mb-16 relative">
          <h2 className="text-3xl sm:text-4xl bai-jamjuree-medium mb-4">
            Simple,{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-sky-500">
              Transparent
            </span>{" "}
            Pricing
          </h2>
          <p
            className={` ${
              isDarkMode ? "text-gray-100" : "text-gray-600"
            } max-w-2xl mx-auto text-xs md:text-sm space-grotesk`}
          >
            Choose the plan that fits your needs. SDK and other premium features
            for teams.
          </p>
          {/* <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-70"></div> */}
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Tier */}
          <div
            className={`group relative p-8 bg-gradient-to-br dark:from-black dark:to-white/10 from-white to-gray-200  rounded-xl border  group-hover:border-indigo-500`}
          >
            {/* accent gradient background */}

            {/* rest of the info */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-purple-500/30 transition-all duration-500 pointer-events-none "></div>

            <div className="mb-6">
              <h3 className="bai-jamjuree-semibold text-2xl mb-2">Community</h3>
              <p
                className={`space-grotesk ${
                  isDarkMode ? "text-gray-100" : "text-gray-600"
                } text-sm`}
              >
                Good for casual use and basic information gathering.
              </p>
            </div>

            <div className="mb-8">
              <span className="text-4xl bai-jamjuree-bold">$0</span>
              <span className="space-grotesk text-gray-500">/forever</span>
            </div>

            <ul
              className={`"space-y-4 mb-8 space-grotesk ${
                isDarkMode ? "text-gray-100" : "text-gray-700"
              } text-sm"`}
            >
              <li className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Public knowledge base access
              </li>

              <li className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Community contributions
              </li>
              <li className="flex items-center gap-2 ">
                <FiCheckCircle className="text-green-500" />
                Web Search
              </li>
              <li className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Customer support
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <FiLock className="text-gray-400" />
                Unlimited questions
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <FiLock className="text-gray-400" />
                AI powered ChatRooms
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <FiLock className="text-gray-400" />
                Limited Private documents
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <FiLock className="text-gray-400" />
                Developer API
              </li>
            </ul>
            <Link to="/Interface">
              <button
                className={`"w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg border border-gray-300 bai-jamjuree-medium  transition-colors cursor-pointer dark:bg-white dark:text-black bg-black text-white bai-jamjuree-bold`}
              >
                Get Started
                <MdArrowForward />
              </button>
            </Link>
          </div>

          {/* Pro Tier (Featured) */}
          <div
            className={`group relative p-8 bg-gradient-to-br dark:from-black dark:to-white/10 from-white to-gray-200  rounded-xl border `}
          >
            {/* accent gradient background */}

            {/* rest of the info */}
            <div className="group-hover:border-green-500 absolute -top-3 right-6 bg-gradient-to-r from-teal-500 to-green-500 text-white text-xs bai-jamjuree-medium px-3 py-1 rounded-full">
              Most Popular
            </div>

            <div className="mb-6">
              <h3 className="bai-jamjuree-semibold text-2xl mb-2">Pro</h3>
              <p
                className={`space-grotesk ${
                  isDarkMode ? "text-gray-100" : "text-gray-600"
                } text-sm`}
              >
                Good for Professionals, Teams, Students, Friends group and other
                Individuals{" "}
              </p>
            </div>

            <div className="mb-8">
              <span className="text-4xl bai-jamjuree-bold">$30</span>
              <span className="space-grotesk text-gray-500">/month</span>
            </div>

            <ul
              className={`"space-y-4 mb-8 space-grotesk ${
                isDarkMode ? "text-gray-100" : "text-gray-700"
              } text-sm"`}
            >
              <li className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Everything in Community
              </li>
              <li className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Private documents
              </li>
              <li className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Web Search
              </li>
              <li className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Priority support
              </li>
              <li className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Custom knowledge bases
              </li>
              <li className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Developer API
              </li>
              <li className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                AI powered chatrooms
              </li>
              <li className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                24/7 Customer support
              </li>
            </ul>
            <button
              onClick={() => {
                toast(
                  "Thanks for your intereset but , this feature is currently not active !"
                );
              }}
              className={`"w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg border border-gray-300 bai-jamjuree-medium  transition-colors cursor-pointer dark:bg-white dark:text-black bg-black text-white`}
            >
              Subscribe
              <BiPurchaseTag />
            </button>
          </div>

          {/* Enterprise Tier */}
          <div
            className={`group relative p-8 bg-gradient-to-br dark:from-black dark:to-white/10 from-white to-gray-200  rounded-xl border`}
          >
            {/* accent gradient background */}

            {/* rest of the info */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-500/30 transition-all duration-500 pointer-events-none"></div>

            <div className="mb-6">
              <h3 className="bai-jamjuree-semibold text-2xl mb-2 flex items-center gap-3">
                Enterprise
                <span className="text-gray-400 text-sm space-grotesk">
                  (Will be active soon)
                </span>
              </h3>

              <p
                className={`space-grotesk ${
                  isDarkMode ? "text-gray-100" : "text-gray-600"
                } text-xs`}
              >
                For large teams & organizations
              </p>
            </div>

            <div className="mb-8">
              <span className="text-4xl bai-jamjuree-bold">Custom</span>
            </div>

            <ul
              className={`"space-y-4 mb-8 space-grotesk ${
                isDarkMode ? "text-gray-100" : "text-gray-700"
              } text-sm"`}
            >
              <li className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Everything in Pro
              </li>
              <li className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Dedicated instance
              </li>
              <li className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                SSO & advanced security
              </li>
              <li className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Custom AI training
              </li>
            </ul>

            <button
              onClick={() => {
                toast(
                  "Thanks for your intereset but , this feature is currently not active !"
                );
              }}
              className={`"w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg border border-gray-300 bai-jamjuree-medium  transition-colors cursor-pointer dark:bg-white dark:text-black bg-black text-white`}
            >
              Live Soon
              <MdScale />
            </button>
          </div>
        </div>

        {/* FAQ section */}
        <div className="max-w-3xl mx-auto mt-20 px-4 sm:px-0">
          <h3 className="bai-jamjuree-semibold text-2xl md:text-3xl mb-8 text-center text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h3>

          <div className="space-y-2">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <button
                  onClick={() => setShow(show === faq.id ? 0 : faq.id)}
                  className="flex justify-between items-center w-full py-4 px-2 text-left cursor-pointer 
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg
                               transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800"
                  aria-expanded={show === faq.id}
                  aria-controls={`faq-${faq.id}`}
                >
                  <span className="bai-jamjuree-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                    {faq.question}
                  </span>
                  <FiChevronDown
                    className={`text-purple-600 dark:text-purple-400 transition-transform duration-200 
                                  ${
                                    show === faq.id
                                      ? "rotate-180 transform-gpu"
                                      : "rotate-0 transform-gpu"
                                  }`}
                    style={{ willChange: "transform" }}
                  />
                </button>

                <div
                  id={`faq-${faq.id}`}
                  className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] 
                              ${
                                show === faq.id
                                  ? "max-h-[500px] opacity-100 translate-y-0"
                                  : "max-h-0 opacity-0 -translate-y-2"
                              }`}
                  style={{
                    willChange: "height, opacity, transform",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div className="pb-4 px-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base space-grotesk">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Toaster />
      </div>
    </>
  );
};

export default Pricing;
