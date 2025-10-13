import { motion } from "framer-motion";

const TypingIndicator = () => {
  return (
    <>
      <div className="my-10 justify-self-start flex items-center justify-center gap-2 space-grotesk">
        Typing..
        <span className="flex items-center justify-center gap-2">
          <motion.span
            className="bg-gray-500 rounded-full h-2 w-2"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: 0,
            }}
          />
          <motion.span
            className="bg-gray-500 rounded-full h-2 w-2"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: 0.2,
            }}
          />
          <motion.span
            className="bg-gray-500 rounded-full h-2 w-2"
            animate={{ y: [0, -7, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: 0.4,
            }}
          />
        </span>
      </div>
    </>
  );
};

export default TypingIndicator;
