import React from "react";
// const Testimonials = React.lazy(() => import("@/components/Testimonials"));
const Why = React.lazy(() => import("./Why.tsx"));
const Pricing = React.lazy(() => import("@/components/Pricing"));
const Footer = React.lazy(() => import("@/components/Footer.tsx"));
// import Marquee from "@/components/marquee";
import Hero from "@/components/Landing_Hero.tsx";
import { Features } from "./Features.tsx";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield, Zap } from "lucide-react";
///words that render dynamically
const words = [
  "Unbiased",
  "Grounded",
  "Limitless",
  "Agentic",
  "Private",
  "Federated ",
  "Verified",
  "Shared",
];

const LandingPage = () => {
  const [value, setValues] = React.useState(words[0]);

  //upadte the value of value after every 1 second
  React.useEffect(() => {
    let i = 1;
    const interval = setInterval(() => {
      setValues(words[i]);
      i = (i + 1) % words.length;
    }, 4000);

    return () => clearInterval(interval);
  }, []);
  return (
    <>
      <Hero value={value} />
      <Why />
      <Features />
      <Pricing />

      {/* <Testimonials /> */}

      {/* final cta */}
      <section className="relative overflow-hidden bg-white dark:bg-black w-full py-14  ">
        {/* 1. Background Architecture - Subtle Grid and Beam */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

          {/* Subtle radial glow to replace the old blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 dark:bg-red-500/10 blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-orange-500/5 backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] space-grotesk font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">
              Ready for Deployment
            </span>
          </div>

          <div className="space-y-4 text-center">
            <h2 className="text-black dark:text-white bai-jamjuree-bold text-3xl md:text-5xl max-w-3xl leading-[1.1] tracking-tight">
              Ready to build a{" "}
              <span className="relative inline-block">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={value}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-pink-400"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                  >
                    {value}
                  </motion.span>
                </AnimatePresence>
              </span>
              <br /> knowledge base?
            </h2>

            <p className="space-grotesk text-sm md:text-base text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
              "Stop researching in silos. Connect your documents, verify your sources, and build a living intelligence engine today."
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center mt-4">
            <Link
              to="/Interface"
              className="group relative flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-sm bai-jamjuree-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 overflow-hidden"
            >
              {/* Hover effect internal fill */}
              <div className="absolute inset-0 bg-orange-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

              <span className="relative z-10 flex items-center gap-2">
                Start Building <Zap size={16} fill="currentColor" />
              </span>
            </Link>

            <button className="group px-8 py-4 rounded-sm border border-neutral-200 dark:border-neutral-800 hover:border-orange-500/50 transition-all flex items-center gap-2 text-neutral-500 hover:text-black dark:hover:text-white">
              <a href="#pricing" className="space-grotesk text-xs uppercase font-bold tracking-widest flex items-center gap-2">
                View Plans <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center gap-8 mt-8 opacity-40 dark:opacity-20 grayscale">
            <div className="flex items-center gap-2 text-xs font-mono">
              <Shield size={14} /> SOC2_READY
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <Zap size={14} /> REALTIME_SYNC
            </div>
          </div>
        </div>
      </section>
      {/* <Marquee /> */}
      <Footer />
    </>
  );
};

export default LandingPage;
