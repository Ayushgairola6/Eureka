import { motion } from "framer-motion";
import React from "react";
type Props = {
  from: string;
  via: string;
  to: string;
  dark_from: string;
  dark_via: string;
  dark_to: string;
};
export const LightBlob: React.FC<Props> = ({
  from,
  via,
  to,
  dark_from,
  dark_via,
  dark_to,
}) => {
  return (
    <>
      <motion.div
        animate={{ rotate: [10, 20, 15, 5, -10, -40, -20, 10, 20] }}
        transition={{ duration: 3, ease: "linear", repeat: Infinity }}
        className={`pointer-events-none absolute -top-10   
        h-4/5 w-full md:w-1/2 blur-[100px] bg-gradient-to-r ${from} ${via} ${to} ${dark_from} ${dark_via} ${dark_to}
          `}
      />
    </>
  );
};
