import { FiCheckCircle } from "react-icons/fi";
// import { toast } from "sonner";
// import { Link } from "react-router";
// import { useAppSelector } from "../store/hooks.tsx";
// import { MdScale, MdArrowForward } from "react-icons/md";
// import { BiPurchaseTag } from "react-icons/bi";
// import { FAQ } from "./FAQ.tsx";

import { BiPurchaseTag } from "react-icons/bi";
import { BsArrowRight } from "react-icons/bs";
import { IoCall } from "react-icons/io5";
import { Link } from "react-router";

const Pricing = () => {
  // const stripePromise = loadStripe('your-publishable-key-here');
  const PlanDetails = [
    {
      id: 1,
      planName: "Explorer",
      price: "$0",
      label: "Free Forever",
      description:
        "Ideal for verifying facts and exploring the public knowledge base.",
      features: [
        "Access to Public Knowledge Base",
        "Community-Verified Search",
        "Standard Web Search",
        "Short-Term Context Memory", // Sells the "Long Memory" upgrade
        "2 Private Documents (max 5 pgs)",
        "Standard AI Response Mode",
      ],
      not_available: [
        "Neuro-Symbolic Audit Engine",
        "Synthesis Mode (Team Research)",
        "Collaborative Eureka Rooms",
        "Persistent Long-Term Memory",
        "Unlimited Private RAG",
      ],
      validity: "Forever",
      cta: "Start Exploring",
      highlight: false,
    },
    {
      id: 4, // Added as a "Sprint" option
      planName: "Sprint Pass",
      price: "$7",
      label: "Single Project",
      description: "Full power for 7 days. No subscription required.",
      features: [
        "All Architect Features",
        "Verified Neuro-Symbolic Logic",
        "Priority Compute",
        "30 queries per day",
      ],
      validity: "7 Days",
      isPass: true, // Special flag for styling
    },
    {
      id: 2,
      planName: "Architect",
      price: "$25",
      label: "Most Popular",
      description:
        "For power users who need deep reasoning and massive memory.",
      features: [
        "Everything in Explorer",
        "Neuro-Symbolic Audit Engine", // Your core differentiator
        "Synthesis Mode (Deep Research)",
        "Long-Term Persistent Memory",
        "Unlimited Queries & Web Search",
        "50 Private Documents (OCR Incl.)",
        "Priority Verification Quota",
      ],
      not_available: ["Custom Enterprise RAG", "Dedicated Room Infrastructure"],
      validity: "Per Month",
      cta: "Upgrade to Architect",
      highlight: true, // Use this to apply your "Arctic Neon" glow to this card
    },
    {
      id: 3,
      planName: "Ecosystem",
      price: "Custom",
      label: "Enterprise Scale",
      description:
        "Full-scale intelligence infrastructure for large organizations.",
      features: [
        "Everything in Architect",
        "Unlimited Collaborative Rooms",
        "Unlimited Private Document RAG",
        "Custom Model Fine-Tuning",
        "White-Label Knowledge Hub",
        "API Access for Workflows",
        "Dedicated Support Engineer",
        "SSO & Advanced Security",
      ],
      not_available: [],
      validity: "Annual/Custom",
      cta: "Contact Sales",
      highlight: false,
    },
  ];
  return (
    <>
      <div
        id="pricing"
        className={`bg-white dark:bg-black p-4 w-full h-auto pricing`}
      >
        {/* heading section */}
        <header className="text-center px-2 py-4">
          <h1 className="bai-jamjuree-bold md:text-3xl text-2xl text-black dark:text-white">
            Transparent Pricing
          </h1>
          <p className="bai-jamjuree-regular text-xs md:text-sm dark:text-gray-300 text-gray-600">
            Choose the plan that fits your needs
          </p>
        </header>
        {/* the cards rendering */}
        <div className=" flex  w-full ">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-5 gap-x-4 p-4 mx-auto md:w-[95%] w-full ">
            {PlanDetails.map((plan, index) => {
              return (
                <>
                  <div
                    key={index}
                    className={`shadow-2xl relative flex flex-col h-full rounded-2xl p-6 transition-all duration-300 border 
    ${
      plan.id === 2
        ? "bg-white dark:bg-neutral-900 border-cyan-500 shadow-[0_0_40px_-15px_rgba(6,182,212,0.3)] scale-[1.03] "
        : plan.id === 4
        ? "scale-[1.01] border-amber-500/70"
        : "bg-gray-50/50 dark:bg-black/40 border-gray-200 dark:border-white/10 shadow-xl"
    }`}
                  >
                    {/* Plan Header */}
                    <section className="mb-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="bai-jamjuree-bold text-3xl tracking-tight">
                          {plan.planName}
                        </h3>
                        {plan.id === 2 ? (
                          <span className="bg-cyan-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full">
                            Recommended
                          </span>
                        ) : plan.id === 4 ? (
                          <span className="bg-amber-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full">
                            Quick access
                          </span>
                        ) : null}
                      </div>
                      <p className="space-grotesk text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        {plan.description}
                      </p>
                    </section>

                    {/* Price Section */}
                    <section className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl bai-jamjuree-bold tracking-tighter">
                          {plan.price}
                        </span>
                        <span className="text-sm space-grotesk text-gray-400">
                          /{plan.validity}
                        </span>
                      </div>
                      <p className="text-xs space-grotesk font-medium text-emerald-500 mt-1 uppercase tracking-wider">
                        {plan.label}
                      </p>
                    </section>

                    {/* Features List */}
                    <section className="flex-grow space-y-4 mb-8">
                      {/* Available Features */}
                      {plan.features.map((feat, ind) => (
                        <div
                          key={ind}
                          className="flex items-start gap-3 text-sm space-grotesk group"
                        >
                          <FiCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {feat}
                          </span>
                        </div>
                      ))}

                      {/* Unavailable Features (The "Upsell" visual) */}
                      {plan.not_available?.map((feat, ind) => (
                        <div
                          key={ind}
                          className="flex items-start gap-3 text-sm space-grotesk opacity-30 grayscale"
                        >
                          <FiCheckCircle className="mt-0.5 flex-shrink-0" />
                          <span className="line-through">{feat}</span>
                        </div>
                      ))}
                    </section>

                    {/* The CTA Button - Full width for PWA touch targets */}
                    <button
                      className={`w-full py-4 px-4 rounded-xl bai-jamjuree-semibold flex items-center justify-center gap-2 transition-all active:scale-95
   bg-black text-white dark:bg-white dark:text-black`}
                    >
                      {plan.id === 1 ? (
                        <>
                          <Link
                            className="flex items-center justify-center gap-3"
                            to="/Interface"
                          >
                            Try for free <BsArrowRight />
                          </Link>
                        </>
                      ) : plan.id === 2 || plan.id === 4 ? (
                        <>
                          Get Started <BiPurchaseTag />
                        </>
                      ) : (
                        <>
                          Contact Sales <IoCall />
                        </>
                      )}
                    </button>
                  </div>
                </>
              );
            })}
          </div>
        </div>

        {/* <FAQ /> */}
      </div>
    </>
  );
};

export default Pricing;
