import React from "react";
import { motion } from "framer-motion";
type LoadingProp = {
  userStatus: string;
};

const LoadingIndicator: React.FC<LoadingProp> = ({ userStatus }) => {
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        {userStatus === "pending" ? (
          <>
            <section className="text-center flex items-center flex-col gap-2">
              <div className="flex items-center gap-[3px] h-5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-green-500 rounded-sm" // Sharp corners (sm) and tech green
                    animate={{
                      height: ["16px", "26px", "16px"], // Grow and shrink
                      opacity: [0.5, 1, 0.5], // Pulse opacity
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
              <h1 className=" bai-jamjuree-semibold text-xs">
                Updating your dashboard
              </h1>
            </section>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center">
              <img className="h-40 w-40" src="/404.png" alt="error" />
              <h1 className="bai-jamjuree-semibold uppercase">
                Something went wrong{" "}
              </h1>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default LoadingIndicator;
