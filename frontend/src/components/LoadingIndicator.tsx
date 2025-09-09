import { motion } from "framer-motion";
import React from "react";
type LoadingProp = {
  text: string;
};

const LoadingIndicator: React.FC<LoadingProp> = ({ text }) => {
  return (
    <>
      <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-200 rounded-xl p-6 flex flex-col items-center">
          <p className="bai-jamjuree-bold text-green-500 flex items-center justify-center gap-2">
            {text}
            <motion.ul
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: 0,
              }}
              className="bg-green-500 rounded-full h-2 w-2"
            />
            <motion.ul
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: 1,
              }}
              className="bg-green-500 rounded-full h-2 w-2"
            />
            <motion.ul
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: 2,
              }}
              className="bg-green-500 rounded-full h-2 w-2"
            />
          </p>
        </div>
      </div>
    </>
  );
};

export default LoadingIndicator;
