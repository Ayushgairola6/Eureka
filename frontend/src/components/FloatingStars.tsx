import { motion } from "framer-motion";
import { FiStar } from "react-icons/fi";
const FloatingStars = () => {
  // array of stars with ra

  // Create array of stars with random positions
  const stars = Array.from({ length: 10 }, (_, index) => ({
    id: index,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 12 + 8}px`, // Random size between 8-20px
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2, // Random duration between 3-5s
  }));

  return (
    <>
      <div className="absolute top-0 left-0 h-full w-full z-[-2] overflow-hidden">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
            }}
            animate={{
              opacity: [0.2, 1, 0.2], // Blinking effect
              rotate: 360, // Full rotation
              scale: [0.8, 1.2, 0.8], // Pulsing scale
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: star.delay,
            }}
          >
            <FiStar className="dark:text-gray-100 text-gray-400 " size="100%" />
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default FloatingStars;
