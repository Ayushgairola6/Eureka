import {
    FiCheckCircle,
    FiLock,
    FiChevronDown
} from 'react-icons/fi';
import { useState } from 'react';
import { BiPurchaseTag } from 'react-icons/bi';
import { toast, Toaster } from 'sonner';
import { Link } from 'react-router';
const Pricing = () => {

    const faqs = [
        {
            id: 1,
            question: "Can I keep my documents private ?",
            answer: "Yes, you can choose visibility type of the document your document when uploading your files ."
        },
        {
            id: 2,
            question: "How can I access my personal documents",
            answer: "In the Query interface you can see an option to see all your private docs which you can simply choose by clicking them and start querying in micro second."
        },
        {
            id: 3,
            question: "What features does the premium version offers ?",
            answer: "The premium version has all features from private secure personal documents , access to community contibuted knowledge and many upcoming features as a beta tester ."
        },
        {
            id: 4,
            question: "Can I cancel my subscription any time ?",
            answer: "Yes you can cancel your subscription only upto 20 hours of you taking the subscription."
        }, {
            id: 5,
            question: "What are the upcoming features ?",
            answer: "Upcoming features contains significant changes in how the ai responds and also access to other services and potential offline usage with APIs to access your docs and a plug and use features"
        }
    ];
    const [show, setShow] = useState<Number>(0);

    return (<>
        <div className="relative py-20 px-4 sm:px-6 z-[1] overflow-hidden bg-gray-50">
            {/* Gradient background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-600/10 to-lime-800/10 blur-3xl z-[-2]"></div>
            <div className="absolute top-1/3 left-1/4 w-40 h-40 rounded-full bg-purple-600/10 blur-3xl z-[-1] animate-float"></div>

            {/* Section header */}
            <div className="max-w-4xl mx-auto text-center mb-16 relative">
                <h2 className="text-3xl sm:text-4xl bai-jamjuree-medium mb-4">
                    Simple, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Transparent</span> Pricing
                </h2>
                <p className="space-grotesk text-gray-600 max-w-2xl mx-auto text-xs md:text-sm space-grotesk">
                    Choose the plan that fits your needs. Open-source forever, premium options for teams.
                </p>
                {/* <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-70"></div> */}
            </div>

            {/* Pricing cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">

                {/* Free Tier */}
                <div className="group relative p-8 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ">
                    {/* accent gradient background */}

                    {/* rest of the info */}
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-purple-500/30 transition-all duration-500 pointer-events-none"></div>

                    <div className="mb-6">
                        <h3 className="bai-jamjuree-semibold text-2xl mb-2">Community</h3>
                        <p className="space-grotesk text-gray-600 text-sm">Free access to public knowledgebase and Unlimited contributions</p>
                    </div>

                    <div className="mb-8">
                        <span className="text-4xl bai-jamjuree-bold">$0</span>
                        <span className="space-grotesk text-gray-500">/forever</span>
                    </div>

                    <ul className="space-y-4 mb-8 space-grotesk text-gray-700 text-sm">
                        <li className="flex items-center gap-2">
                            <FiCheckCircle className="text-green-500" />
                            Public knowledge base access
                        </li>

                        <li className="flex items-center gap-2">
                            <FiCheckCircle className="text-green-500" />
                            Community contributions
                        </li>
                        <li className="flex items-center gap-2">
                            <FiLock className="text-gray-500" />
                            Unlimited questions
                        </li>
                        <li className="flex items-center gap-2 text-gray-400">
                            <FiLock className="text-gray-400" />
                            Private documents
                        </li>
                    </ul>
                    <Link to="/Interface">
                        <button className="w-full py-3 px-6 rounded-lg border border-gray-300 bai-jamjuree-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
                            Get Started
                        </button>
                    </Link>
                </div>

                {/* Pro Tier (Featured) */}
                <div className="group relative p-8 bg-white/90 backdrop-blur-sm rounded-xl border border-black shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 transform ">
                    {/* accent gradient background */}

                    {/* rest of the info */}
                    <div className="absolute -top-3 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs bai-jamjuree-medium px-3 py-1 rounded-full">
                        Most Popular
                    </div>

                    <div className="mb-6">
                        <h3 className="bai-jamjuree-semibold text-2xl mb-2">Pro</h3>
                        <p className="space-grotesk text-gray-600 text-sm">For professionals , small teams , students and other Individuals </p>
                    </div>

                    <div className="mb-8">
                        <span className="text-4xl bai-jamjuree-bold">$20</span>
                        <span className="space-grotesk text-gray-500">/month</span>
                    </div>

                    <ul className="space-y-4 mb-8 space-grotesk text-gray-700 text-sm">
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
                            Priority support
                        </li>
                        <li className="flex items-center gap-2">
                            <FiCheckCircle className="text-green-500" />
                            Custom knowledge bases
                        </li>
                    </ul>

                    <button className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-lg bg-gradient-to-r bg-black CustPoint text-white bai-jamjuree-medium hover:opacity-90 transition-opacity ">
                        Subscribe <BiPurchaseTag />
                    </button>

                </div>

                {/* Enterprise Tier */}
                <div className="group relative p-8 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    {/* accent gradient background */}

                    {/* rest of the info */}
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-500/30 transition-all duration-500 pointer-events-none"></div>

                    <div className="mb-6">
                        <h3 className="bai-jamjuree-semibold text-2xl mb-2">Enterprise</h3>
                        <p className="space-grotesk text-gray-600 text-sm">For large teams & organizations</p>
                    </div>

                    <div className="mb-8">
                        <span className="text-4xl bai-jamjuree-bold">Custom</span>
                    </div>

                    <ul className="space-y-4 mb-8 space-grotesk text-gray-700 text-sm">
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


                    <button onClick={() => {
                        toast("Thanks for your intereset but , this feature is currently not active !")
                    }} className="w-full py-3 px-6 rounded-lg border border-gray-300 bai-jamjuree-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
                        Contact Sales
                    </button>
             

            </div>
        </div>

        {/* FAQ section */}
        <div className="max-w-3xl mx-auto mt-20">
            <h3 className="bai-jamjuree-semibold text-2xl mb-8 text-center">Frequently Asked Questions</h3>

            <div className="space-y-4 ">
                {faqs.map((faq, index) => (
                    <div key={index} onClick={() => {
                        if (faq.id === show) {
                            setShow(0)
                        } else {
                            setShow(faq.id);
                        }
                    }} className={` border-b border-gray-200 pb-4    rounded-lg  bai-jamjuree-regular ${show === faq.id ? " h-30 " : "h-8  overflow-hidden  "}  transition-all duration-200 `}>
                        <div className={``}>
                            <button className="flex justify-between items-center w-full space-grotesk-medium text-left cursor-pointer">
                                <span>{faq.question}</span>
                                <FiChevronDown className={`text-purple-600 transition-transform duration-300 ${show === faq.id ? "rotate-45" : "rotate-0"} `} />
                            </button>
                            <div className={`mt-2 space-grotesk ${show === faq.id ? "text-purple-600 opacity-100" : "opacity-0 text-gray-400"} text-xs`}>
                                {faq.answer}
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
        <Toaster />
    </div >
    </>)
}

export default Pricing