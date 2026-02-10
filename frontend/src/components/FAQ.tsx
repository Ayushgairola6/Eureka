import React from "react";
import { FiChevronDown } from "react-icons/fi";

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
const [show, setShow] = React.useState<Number>(0);
export const FAQ = () => {
  return (
    <>
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
    </>
  );
};
