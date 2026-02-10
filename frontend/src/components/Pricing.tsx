import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { BiPurchaseTag } from "react-icons/bi";
import { Crown, Target, Zap } from "lucide-react";


const Pricing = () => {
  // const stripePromise = loadStripe('your-publishable-key-here');
  const PlanDetails = [
    {
      id: 1,
      planName: "FREE",
      price: "$0",
      label: "Free Forever",
      description:
        "Ideal for verifying facts and exploring the public knowledge base.",
      features: [
        "One time limited quota",
        "Access to community contributed public knowledgebase",
        "Limited surface web search",
        "Very Short term memory for AI", // Sells the "Long Memory" upgrade
        "2 Private Documents (max 5 pgs)",
        "Standard AI Response Mode",
      ],
      not_available: [
        "Advanced mutlti source analysis",
        "Autonomus deep web search",
        "Collaborative AntiNode Rooms",
        "Persistent Long-Term Memory",
        "Unlimited Private RAG",
      ],
      validity: "Forever",
      cta: "Try now",
      highlight: false,
    },
    {
      id: 2,
      planName: "Architect",
      price: "$25",
      label: "Easy to use",
      description:
        "For teams and individuals doing research, content creation and small scale team managements.",
      features: [
        "Everything in Explorer",
        "Advanced multi source synthesis mode", // Your core differentiator
        "10 Antinode rooms",
        "Solo & Workspace session only Persistent Memory.",
        "Unlimited Queries & Web Search ",
        "50 Private Documents upto 50mb size",
        "24/7 customer support",
        "Transparency layer always visible"
      ],
      not_available: ["Custom Enterprise RAG", "Dedicated Room Infrastructure", 'Dedicated support', "Long memory retention"],
      validity: "Per Month",
      cta: "Order now",
      highlight: true, // Use this to apply your "Arctic Neon" glow to this card
    },
    {
      id: 4, // Added as a "Sprint" option
      planName: "Sprint Pass",
      price: "$10",
      label: "Single time purchase",
      description: "Access to core features without commitment.",
      features: [
        "All Architect Features",
        "One time customer support",
        "Limited AntiNode rooms",
        "50 queries per day quota",
        'Short solo use AI memory'
      ],
      not_available: ["Large workspace and Solor AI memory clusters", "Unlimited shards", 'Full time support'],

      validity: "7 Days",
      cta: "Order now",
      isPass: true, // Special flag for styling
    },
    {
      id: 3,
      planName: "Planners",
      price: "120$",
      label: "Large scale",
      description:
        "Full set of features for large teams and individuals working as freelancers, consultants etc specializations.",
      features: [
        "Everything in Architect",
        "Unlimited Antinode Collaborative Rooms",
        "Unlimited Private Document RAG",
        "Dedicated 24/7 customer support",
        "Best orchrestration algorithms",
        "Better model reasoning capabilities and algorithms.",
        "Deep transparency layer visibility",
        "Unlimited Private document summarization and analysis",
        'Longer workspace and Solor use AI memories'
      ],
      not_available: [],
      validity: "month",
      cta: "Order now",
      highlight: false,
    },
    // {
    //   id: 3,
    //   planName: "Ecosystem",
    //   price: "Custom",
    //   label: "Enterprise Scale",
    //   description:
    //     "Full-scale intelligence infrastructure for large organizations.",
    //   features: [
    //     "Everything in Architect",
    //     "Unlimited Collaborative Rooms",
    //     "Unlimited Private Document RAG",
    //     "Custom Model Fine-Tuning",
    //     "White-Label Knowledge Hub",
    //     "API Access for Workflows",
    //     "Dedicated Support Engineer",
    //     "SSO & Advanced Security",
    //   ],
    //   not_available: [],
    //   validity: "Annual/Custom",
    //   cta: "Contact Sales",
    //   highlight: false,
    // },
  ];
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

                  <button
                    className={`w-full py-4 rounded-sm space-grotesk font-bold text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all active:scale-95
                    ${isRecommended
                        ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20"
                        : "bg-black text-white dark:bg-white dark:text-black hover:opacity-80"
                      }`}
                  >
                    {plan.cta} <BiPurchaseTag size={14} />
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
