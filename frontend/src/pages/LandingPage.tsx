import React from "react";
const Testimonials = React.lazy(() => import("@/components/Testimonials"));
const Why = React.lazy(() => import("./Why.tsx"));
const Pricing = React.lazy(() => import("@/components/Pricing"));
const Footer = React.lazy(() => import("@/components/Footer.tsx"));
// import Marquee from "@/components/marquee";
import Hero from "@/components/Landing_Hero.tsx";
import { Features } from "./Features.tsx";
import { Link } from "react-router";
import { motion } from "framer-motion";
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

      <Testimonials />
      {/* <Tutorial /> */}

      {/* final cta */}
      <section className="relative overflow-hidden bg-white dark:bg-black w-full py-20 border-t border-gray-100 dark:border-white/5">
        {/* Optional: Add a very faint blob behind the text to tie back to your "Why" section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col items-center justify-center gap-6 px-4">
          <h2 className="text-black dark:text-white bai-jamjuree-bold text-2xl md:text-4xl max-w-2xl text-center leading-tight">
            Ready to build a{" "}
            <motion.span
              className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 via-blue-500 to-emerald-400"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
              key={value}
            >
              {value}
            </motion.span>{" "}
            knowledge base?
          </h2>

          <p className="space-grotesk text-xs md:text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
            Join researchers and architects using Neuro-Symbolic AI to verify
            the truth.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link
              to="/Interface"
              className="bg-black dark:bg-white text-white dark:text-black shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] hover:shadow-cyan-500/20 transition-all rounded-xl py-3 px-6 bai-jamjuree-semibold text-sm md:text-md active:scale-95"
            >
              Start Building for Free &rarr;
            </Link>

            {/* Secondary link for the "Sprint Pass" curiosity */}
            <button className="text-gray-500 hover:text-black dark:hover:text-white space-grotesk  transition-colors text-xs md:text-sm">
              <a href="#pricing">View all plans &rarr;</a>
            </button>
          </div>
        </div>
      </section>
      {/* <Marquee /> */}
      <Footer />
    </>
  );
};

export default LandingPage;
