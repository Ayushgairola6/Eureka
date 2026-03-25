import React, { useState } from 'react'
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { LucideClockFading, Zap } from "lucide-react";
import axios from 'axios';
import { toast } from "sonner";
import { DodoPayments } from "dodopayments-checkout";
import { useAppSelector } from '../store/hooks'
import { IoBagCheckOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL

const PlanDetails = [
  {
    id: "free_ver1",
    planName: "Free",
    actual_price: null,
    price: "$0",
    label: "Start exploring",
    description:
      "Try AntiNode before committing. Surface-level research with enough depth to see what the platform can do.",
    features: [
      "5 shards per month",
      "Surface web search (basic)",
      "2 private documents (up to 3 pages each)",
      "Access to public knowledge base",
      "Standard AI responses",
    ],
    not_available: [
      "Multi-source synthesis",
      "Deep web research",
      "AntiNode Rooms",
      "Persistent long-term memory",
      "Analyst Mode",
      "Unlimited private documents",
    ],
    validity: "forever",
    cta: "Start for free",
    highlight: false,
    amount: 0,
    currency: "USD",
    plan_type: "free",
    duration: 0,
  },
  {
    id: "pdt_0NbB0WIvUD7WxmAGhvj4d",
    planName: "Architect",
    actual_price: "$20",
    price: "$17",
    label: "Most popular",
    description:
      "For researchers, students, and analysts who need answers they can verify and trust — every session.",
    features: [
      "Unlimited shards & web search",
      "Multi-source synthesis",
      "Deep web research with intent decomposition",
      "50 private documents (up to 50MB)",
      "10 AntiNode collaborative rooms",
      "Persistent memory across sessions",
      "Full transparency layer",
      "24/7 customer support",
    ],
    not_available: [
      "Analyst Mode (mid-research steering)",
      "Enterprise RAG",
      "Extended memory retention",
      "Dedicated infrastructure",
    ],
    validity: "per month",
    cta: "Get Architect",
    highlight: true,
    amount: 1700,
    currency: "USD",
    plan_type: "subscription",
    duration: 30,
  },
  {
    id: "pdt_architect_annual",
    planName: "Architect Annual",
    actual_price: "$204",
    price: "$149",
    label: "Best value",
    description:
      "Full Architect access at $12.40/month. Lock in the lowest price — ideal if research is part of your regular workflow.",
    features: [
      "Everything in Architect",
      "2 months free vs monthly billing",
      "Priority access to new features",
      "Locked-in rate — no price increases",
    ],
    not_available: [
      "Analyst Mode (mid-research steering)",
      "Enterprise RAG",
      "Extended memory retention",
    ],
    validity: "per year",
    cta: "Get Annual Access",
    highlight: false,
    amount: 14900,
    currency: "USD",
    plan_type: "subscription",
    duration: 365,
  },
  {
    id: "pdt_0NbB0EcssZYI3N8z4gh2K",
    planName: "Sprint Pass",
    actual_price: "$20",
    price: "$14",
    label: "No commitment",
    description:
      "Full Architect access for 7 days. One focused research sprint — no subscription needed.",
    features: [
      "All Architect features for 7 days",
      "50 shards per day",
      "5 AntiNode Rooms",
      "Short-term AI memory",
      "One-time customer support",
    ],
    not_available: [
      "Persistent long-term memory",
      "Analyst Mode",
      "Unlimited shards",
      "Ongoing support",
    ],
    validity: "7 days",
    cta: "Get Sprint Pass",
    highlight: false,
    isPass: true,
    amount: 1400,
    currency: "USD",
    plan_type: "one_time",
    duration: 7,
  },
  {
    id: "pdt_0NbB0PaORvBUwALazLDer",
    planName: "Planners",
    actual_price: "$48",
    price: "$38",
    label: "For power users",
    description:
      "For consultants, freelancers, and teams doing heavy research at scale — with full orchestration and memory.",
    features: [
      "Everything in Architect",
      "Analyst Mode — steer research mid-session",
      "Unlimited AntiNode collaborative rooms",
      "Unlimited private document analysis",
      "Extended long-term AI memory",
      "Best orchestration algorithms",
      "Enhanced reasoning capabilities",
      "Dedicated 24/7 priority support",
      "Deep transparency layer",
    ],
    not_available: [],
    validity: "per month",
    cta: "Get Planners",
    highlight: false,
    amount: 3800,
    currency: "USD",
    plan_type: "subscription",
    duration: 30,
  },
];

const Pricing = () => {
  // initiating the payments client

  const { isProcessingPayment } = useAppSelector(s => s.payments);

  React.useEffect(() => {
    DodoPayments.Initialize({
      mode: "test",        // change to "live" in production
      displayType: "overlay",
      onEvent: (event: any) => {
        if (event.event_type === "checkout.error") {
          console.error(event.data?.message);
        }
      },
    });
  }, [])

  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [chosenPlan, setChosenPlan] = useState<string | null>(null) //empty or a plan id



  async function CreateSubscription(offer: any) {
    if (!offer || !offer?.amount || !offer.duration) return;

    setChosenPlan(offer.id)
    try {
      const response = await axios.post(`${BaseApiUrl}/api/create-subscription`, { amount: offer.amount, duration: offer.duration, product_id: offer.id })



      const checkoutUrl = response.data.checkOutUrl;

      await DodoPayments.Checkout.open({
        checkoutUrl,
      });
      return response.data;
    } catch (error: any) {
      console.log(error)
      return toast.error(error?.response?.data?.message || "Unable to create a new subscription for you");
    }
  }



  return (
    <>
      <div id="pricing" className="bg-white dark:bg-[#020202] py-24 w-full relative overflow-hidden">
        {/* Structural Background Decor */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent" />

        <header className="text-center mb-16 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500">Tier Analysis</span>
          </div>
          <h1 className="bai-jamjuree-bold text-3xl md:text-5xl text-black dark:text-white mb-4 tracking-tighter">
            Transparent Pricing
          </h1>
          <p className="space-grotesk text-sm md:text-base dark:text-neutral-400 text-neutral-600 max-w-xl mx-auto italic">
            "Architecture that scales with your intelligence requirements."
          </p>
        </header>

        <div className="max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            {PlanDetails.map((plan, index) => {
              const isRecommended = plan.id === "pdt_architect_annual";

              return (<>
                <div
                  key={index}
                  className={`group relative flex flex-col h-full transition-all duration-300 border
    ${isRecommended
                      ? "bg-neutral-50 dark:bg-neutral-900/50 border-orange-500 shadow-[0_0_0_1px_rgba(249,115,22,0.3)] lg:-translate-y-2"
                      : "bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                    } rounded-sm`}
                >
                  {/* Top corner notch for recommended */}
                  {isRecommended && (
                    <div className="absolute top-0 right-0 w-0 h-0 border-solid border-t-[28px] border-r-[28px] border-t-orange-500 border-r-orange-500 border-b-transparent border-l-transparent" />
                  )}

                  {/* Header */}
                  <div className="px-7 pt-7 pb-5 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bai-jamjuree-bold text-[10px] tracking-[0.18em] uppercase text-neutral-400 dark:text-neutral-500">
                        Protocol
                      </span>
                      {isRecommended && (
                        <span className="bg-orange-500 text-white text-[8px] px-2 py-0.5 font-black uppercase tracking-widest">
                          Standard
                        </span>
                      )}
                    </div>
                    <h3 className="bai-jamjuree-bold text-4xl tracking-tighter uppercase leading-none">
                      {plan.planName}
                    </h3>
                  </div>

                  {/* Price block */}
                  <div className="px-7 py-5 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-baseline gap-2">
                      <span className="bai-jamjuree-bold text-5xl tracking-tighter leading-none">
                        {plan.price}
                      </span>
                      {plan.actual_price && (
                        <span className="space-grotesk text-sm text-neutral-400 line-through">
                          {plan.actual_price}
                        </span>
                      )}
                    </div>
                    <div className="space-grotesk text-[10px] tracking-[0.15em] uppercase text-neutral-400 mt-1.5">
                      / {plan.validity}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="px-7 pt-5 pb-0">
                    <p className="space-grotesk text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="flex-grow px-7 pt-5 pb-6">
                    <p className="text-[9px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.18em] mb-4">
                      Included Protocols
                    </p>
                    <div className="space-y-3">
                      {plan.features.map((feat, ind) => (
                        <div key={ind} className="flex items-start gap-3 text-xs space-grotesk">
                          <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={13} />
                          <span className="text-neutral-700 dark:text-neutral-300">{feat}</span>
                        </div>
                      ))}
                      {plan.not_available?.map((feat, ind) => (
                        <div key={ind} className="flex items-start gap-3 text-xs space-grotesk opacity-20">
                          <div className="w-3 h-px bg-neutral-500 mt-2 flex-shrink-0" />
                          <span className="line-through text-neutral-500">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="px-7 pb-7">
                    <button
                      onClick={() => CreateSubscription(plan)}
                      className={`
        w-full py-4 rounded-sm space-grotesk font-bold text-[10px] tracking-[0.2em] uppercase
        flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98]
        ${isRecommended
                          ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20"
                          : "bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                        }
      `}
                    >
                      {isProcessingPayment && plan.id === chosenPlan ? (
                        <><LucideClockFading className="animate-spin" size={14} /><span>Securing Order...</span></>
                      ) : verifyingPayment && plan.id === chosenPlan ? (
                        <><IoShieldCheckmarkOutline className="animate-pulse" size={14} /><span>Verifying Payment...</span></>
                      ) : (
                        <><IoBagCheckOutline size={14} /><span>{plan.cta}</span></>
                      )}
                    </button>
                  </div>
                </div>
              </>

              );
            })}
          </div>
        </div>

        <footer className="w-full text-center mt-20 flex flex-col items-center gap-2">
          <h3 className="bai-jamjuree-semibold text-sm dark:text-neutral-300">Deployment Assistance Required?</h3>
          <a
            className="group space-grotesk flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-orange-500 transition-colors"
            href="mailto:support@antinodeai.space"
          >
            Open Support Ticket <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </a>
        </footer>
      </div>
    </>
  );
};

export default Pricing;
