import React, { useState } from 'react'
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { LucideClockFading } from "lucide-react";
import axios from 'axios';
import { toast } from "sonner";
import { DodoPayments } from "dodopayments-checkout";
import { useAppSelector } from '../store/hooks'
import { setOrderId, setIsProcessingPayment } from '../store/PaymentsSlice';
import { IoBagCheckOutline } from 'react-icons/io5';
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL

const PlanDetails = [
  {
    id: "free_pilot",
    planName: "Pilot",
    actual_price: null,
    price: "Free",
    label: "Try the engine",
    description:
      "Enough to see how Antinode’s zero‑hallucination, traceable research works. No credit card required.",
    features: [
      "Limited Searaches / month",
      "5 private document pages / month",
      "Standard search depth",
      "Live traceability log (basic, 24h retention)",
      "Access to public knowledge base",
    ],
    not_available: [
      "Analyst Mode (steered research)",
      "Multi‑source synthesis",
      "Deep web research",
      "Private document uploads beyond 5 pages",
      "Collaborative rooms",
      "Long‑term memory",
      "Exportable audit log",
    ],
    validity: "forever",
    cta: "Start free",
    highlight: false,
    amount: 0,
    currency: "USD",
    plan_type: "free",
    duration: 0,
  },
  {
    id: "pdt_0Nd6unrVUY3mDmTxUWJOz",
    planName: "Professional",
    actual_price: "$99",
    price: "$79",
    label: "Launch offer",
    description:
      "For independent analysts, journalists, and consultants who need facts they can stake their reputation on.",
    features: [
      "Better web searches & deep web",
      "Analyst Mode – steer research in real time",
      "Multi‑source synthesis (web + docs)",
      "50 private documents (up to 50MB each)",
      "Live traceability log with full export",
      "30‑day log retention",
      "10 collaborative rooms",
      "Persistent memory across sessions",
      "Standard support (email, 24h response)",
      "All core orchestration & re‑ranking models",
    ],
    not_available: [
      "On‑prem / private cloud deployment",
      "Immutable audit logs",
      "SSO & SIEM integration",
      "Custom re‑ranker training",
      "Priority support SLA",
    ],
    validity: "per month",
    cta: "Start Professional",
    highlight: true,
    amount: 7900,        // $79.00 introductory price
    currency: "USD",
    plan_type: "subscription",
    duration: 30,
  },
  {
    id: "pdt_0Nd6unPTACKgEBk1NcduQ",
    planName: "Professional Annual",
    actual_price: "$948",       // $79 × 12
    price: "$699",              // save ~$250
    label: "Best value",
    description:
      "All Professional features at a discounted rate. For serious researchers who want to lock in and forget about monthly bills.",
    features: [
      "Everything in Professional",
      "Priority access to new features",
      "Locked‑in rate for 12 months",
      "Extended log retention (90 days)",
      "One‑time payment, no auto‑renew without consent",
      "Long‑term memory",
    ],
    not_available: [
      "On‑prem / private cloud deployment",
      "Immutable audit logs",
      "SSO & SIEM integration",
      "Custom re‑ranker training",
    ],
    validity: "per year",
    cta: "Get Annual Professional",
    highlight: false,
    amount: 69900,       // $699.00
    currency: "USD",
    plan_type: "subscription",
    duration: 365,
  },
  {
    id: "enterprise",
    planName: "Enterprise Platform",
    actual_price: "Custom",
    price: "Contact Sales",
    label: "On‑Prem & Private Cloud",
    description:
      "Deploy Antinode’s entire pipeline inside your own infrastructure. Zero data leaves your perimeter. Immutable audit logs. Built for firms where compliance is non‑negotiable.",
    features: [
      "Everything in Professional",
      "Dedicated on‑prem / private cloud instance",
      "Air‑gapped deployment option",
      "Immutable audit logs (configurable retention)",
      "Data never leaves your hardware",
      "SSO, RBAC, SIEM integration",
      "Custom re‑ranker fine‑tuning",
      "Local LLM synthesis module (optional)",
      "99.5% uptime SLA",
      "Dedicated Slack/phone support",
    ],
    not_available: [],
    validity: "custom",
    cta: "Talk to us",
    highlight: false,
    amount: 0,
    currency: "USD",
    plan_type: "none",
    duration: 0,
  },
];
// 
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

  const [chosenPlan, setChosenPlan] = useState<string | null>(null) //empty or a plan id



  async function CreateSubscription(offer: any) {
    if (!offer || !offer?.amount || !offer.duration) return;

    setChosenPlan(offer.id)
    setIsProcessingPayment(true)
    try {
      const response = await axios.post(`${BaseApiUrl}/api/create-subscription`, { amount: offer.amount, duration: offer.duration, product_id: offer.id }, {
        withCredentials: true
      })

      const checkoutUrl = response.data.checkOutUrl;
      console.log(response.data)
      localStorage.setItem("antinode_order_id", response.data.order_id);
      setOrderId(response.data.order_id);
      await DodoPayments.Checkout.open({
        checkoutUrl,
      });
      return response.data;
    } catch (error: any) {
      setIsProcessingPayment(false)

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
              const isRecommended = plan.id === "pdt_0NcYPAXDbJxhN8kKBdulh";

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
                      <span className={`bai-jamjuree-bold ${plan.id === '12' ? 'text-sm' : 'text-5xl'} tracking-tighter leading-none`}>
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
                        <div key={ind} className="flex items-start gap-3 text-xs space-grotesk ">
                          <div className="w-3 h-px  mt-2 flex-shrink-0" />
                          <span className="line-through text-gray-500 dark:text-gray-400">{feat}</span>
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
                      {isProcessingPayment === true && plan.id === chosenPlan ? (
                        <><LucideClockFading className="animate-spin" size={14} /><span>Securing Order...</span></>
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
          <h3 className="bai-jamjuree-semibold text-sm dark:text-neutral-300">For refunds or billing issues, contact us at support@antinodeai.space</h3>
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
