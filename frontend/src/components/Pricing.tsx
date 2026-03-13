import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { Crown, Target, Zap } from "lucide-react";
// import axios from 'axios';
// import { toast } from "sonner";
// import { useAppSelector } from '../store/hooks';
// import { IoBagCheckOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';

// const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL
// interface Plan {
//   id: number, planName: string, amount: number, currency: string, duration: string, plan_type: string
// }

const Pricing = () => {
  // const stripePromise = loadStripe('your-publishable-key-here');
  const PlanDetails = [
    {
      id: 1,
      planName: "Free",
      price: "$0",
      label: "Start exploring",
      description: "Get a feel for AntiNode. Verify facts, explore the knowledge base, and try surface web research.",
      features: [
        "Limited monthly shards",
        "Surface web search (basic)",
        "2 private documents (up to 5 pages each)",
        "Access to public knowledge base",
        "Standard AI responses",
        "Short-term AI memory",
      ],
      not_available: [
        "Multi-source synthesis mode",
        "Deep web research",
        "AntiNode Rooms",
        "Persistent long-term memory",
        "Unlimited private documents",
      ], validity: "forever",
      cta: "Start for free",
      highlight: false,
      amount: 0, currency: 'USD', plan_type: "free", duration: 0
    },
    {
      id: 2,
      planName: "Architect",
      price: "$20",
      label: "Most popular",
      description: "For students, researchers, and professionals who research regularly and need answers they can trust.",
      features: [
        "Unlimited shards & web search",
        "Multi-source synthesis — analyze multiple documents together",
        "Deep web research with intent decomposition",
        "50 private documents (up to 50MB)",
        "10 AntiNode collaborative rooms",
        "Persistent memory across sessions",
        "Full transparency layer",
        "24/7 customer support",
      ],
      not_available: [
        "Enterprise RAG",
        "Dedicated infrastructure",
        "Extended memory retention",
      ],
      validity: "per month",
      cta: "Get Architect",
      highlight: true,
      amount: 20, currency: 'USD', plan_type: "Architect", duration: '30'
    },
    {
      id: 4, // Added as a "Sprint" option
      planName: "Sprint Pass",
      price: "$8",
      label: "No commitment",
      description: "Full access for 14 days. Perfect for a research project, assignment, or trying before committing.",
      features: [
        "All Architect features",
        "50 shards per day",
        "Limited AntiNode Rooms",
        "Short-term AI memory",
        "One-time customer support",
      ],
      not_available: [
        "Persistent long-term memory",
        "Unlimited shards",
        "Full-time support",
      ],
      validity: "14 days",
      cta: "Get Sprint Pass",
      isPass: true, amount: 8, currency: 'USD', plan_type: "sprint pass", duration: '7'
    },
    {
      id: 3,
      planName: "Planners",
      price: "$50",
      label: "For power users",
      description: "For freelancers, consultants, and teams doing heavy research and analysis at scale.",
      features: [
        "Everything in Architect",
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
      highlight: false, amount: 50, currency: 'USD', plan_type: "Planners", duration: '40'
    },

  ];

  // const { user } = useAppSelector(s => s.auth);
  // const [processingPayment, setProcessingPayment] = React.useState(false);
  // const [verifyingPayment, setVerifyingPayment] = React.useState(false)
  // const [chosenPlan, setChosenPlan] = React.useState<number | null>(null)
  // async function verifyPayment(paymentObject: any) {
  //   if (!paymentObject) return;
  //   setVerifyingPayment(true)
  //   try {
  //     const response = await axios.post(`${BaseApiUrl}/api/payments/verify-payment`, paymentObject, {
  //       withCredentials: true
  //     })

  //     if (response.data?.message) {
  //       toast.info(response.data.message);
  //     }
  //     setVerifyingPayment(false)
  //     setChosenPlan(null)

  //     return response.data;
  //   } catch (error: any) {
  //     setChosenPlan(null)

  //     toast.error(error?.response?.data?.message || "An error occured while verifying the payment if you face any issues you can connect with our support at support@antinodeai.space.")
  //     setVerifyingPayment(false)

  //   }
  // }
  // async function HandleOrderCreation(plan: any) {
  //   if (!plan || !plan.amount || !plan.currency) return;
  //   setProcessingPayment(true)
  //   setChosenPlan(plan.id)
  //   try {
  //     const response = await axios.post(`${BaseApiUrl}/api/payments/create-order`, { amount: plan.amount, plan_name: plan.planName, duration: plan.duration, plan_type: plan.plan_type }, {
  //       withCredentials: true,
  //     })


  //     if (response.data.Paymentdata) {
  //       const paymentinfo = response.data.Paymentdata


  //       const options = {
  //         key: "rzp_test_SNXKC107qupHAG", // Public Key
  //         amount: paymentinfo.amount,
  //         currency: "INR",
  //         name: "AntiNodeAI",
  //         order_id: paymentinfo.id,
  //         handler: function (paymentinfo: any) {
  //           verifyPayment(paymentinfo);
  //         },
  //         prefill: {
  //           name: user?.username,
  //           email: user?.email
  //         },
  //         theme: { color: "#3399cc" }
  //       };
  //       const rzp1 = new (window as any).Razorpay(options);
  //       rzp1.open();
  //     }
  //     return response.data;
  //   } catch (error: any) {
  //     setProcessingPayment(false)
  //     setChosenPlan(null)

  //     toast.error(error?.response?.data.message || "An error occured while processing your payment")

  //   }
  // }
  // const isBusy = processingPayment || verifyingPayment
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
              const isRecommended = plan.id === 2;
              const isEnterprise = plan.id === 4;

              return (
                <div
                  key={index}
                  className={`group relative flex flex-col h-full p-8 transition-all duration-500 border
                  ${isRecommended
                      ? "bg-neutral-50 dark:bg-neutral-900/50 border-orange-500/50 shadow-[0_20px_40px_-15px_rgba(6,182,212,0.15)] lg:-translate-y-2"
                      : "bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                    } rounded-sm`}
                >
                  {/* Visual ID Badge */}
                  <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    {isRecommended ? <Zap size={40} /> : isEnterprise ? <Crown size={40} /> : <Target size={40} />}
                  </div>

                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="bai-jamjuree-bold text-2xl tracking-tighter uppercase">
                        {plan.planName}
                      </h3>
                      {isRecommended && (
                        <span className="bg-orange-500 text-white text-[9px] px-2 py-0.5 font-black uppercase tracking-widest">
                          Standard
                        </span>
                      )}
                    </div>
                    <p className="space-grotesk text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed min-h-[40px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl bai-jamjuree-bold tracking-tighter">
                        {plan.price}
                      </span>
                      <span className="text-xs font-mono text-neutral-400">
                        /{plan.validity.toUpperCase()}
                      </span>
                    </div>
                    <div className="h-1 w-12 bg-red-500 mt-2 opacity-50" />
                  </div>

                  <div className="flex-grow space-y-4 mb-10">
                    <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">Included Protocols:</p>
                    {plan.features.map((feat, ind) => (
                      <div key={ind} className="flex items-start gap-3 text-xs space-grotesk">
                        <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-700 dark:text-neutral-300">{feat}</span>
                      </div>
                    ))}

                    {plan.not_available?.map((feat, ind) => (
                      <div key={ind} className="flex items-start gap-3 text-xs space-grotesk opacity-25">
                        <div className="w-3.5 h-[1px] bg-neutral-500 mt-2 flex-shrink-0" />
                        <span className="line-through">{feat}</span>
                      </div>
                    ))}
                  </div>
                  {/* ${isBusy && plan.id === chosenPlan ? "cursor-not-allowed opacity-70" : "active:scale-95"} */}

                  <button
                    // onClick={() => !isBusy && HandleOrderCreation(plan)}
                    // disabled={isBusy}
                    className={`
    w-full py-4 rounded-sm space-grotesk font-bold text-[11px] tracking-[0.2em] uppercase 
    flex items-center justify-center gap-3 transition-all duration-300
    ${isRecommended
                        ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20"
                        : "bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                      }
  `}
                  >
                    {/* {processingPayment && plan.id === chosenPlan ? (
                      <>
                        <LucideClockFading className="animate-spin" size={16} />
                        <span>Securing Order...</span>
                      </>
                    ) : verifyingPayment && plan.id === chosenPlan ? (
                      <>
                        <IoShieldCheckmarkOutline className="animate-pulse" size={16} />
                        <span>Verifying Payment...</span>
                      </>
                    ) : (
                      <>
                        <IoBagCheckOutline size={16} />
                        <span>{plan.cta}</span>
                      </>
                    )} */}
                    {plan.cta}
                  </button>
                </div>
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
