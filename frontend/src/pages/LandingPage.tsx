import React from "react";
const Testimonials = React.lazy(() => import("@/components/Testimonials"));
const Why = React.lazy(() => import("./Why.tsx"));
const Pricing = React.lazy(() => import("@/components/Pricing"));
const Footer = React.lazy(() => import("@/components/Footer.tsx"));
import Marquee from "@/components/marquee";
import Hero from "@/components/Landing_Hero.tsx";
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
      <Testimonials />
      {/* <Tutorial /> */}
      <Pricing />
      <Marquee />
      <Footer />
    </>
  );
};

export default LandingPage;
