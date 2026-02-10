import React from "react";
import { useScroll, useTransform, motion } from "framer-motion";
type Props = {
  children: any;
};
export const GravityWell: React.FC<Props> = ({ children }) => {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // 1. Tilt toward the center:
  // As the card enters (-20deg), hits center (0deg), exits (20deg)
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [25, 0, -25]);
  const rotateZ = useTransform(scrollYProgress, [0, 0.5, 1], [-5, 0, 5]);

  // 2. The "Compression" effect:
  // Card feels heavier/smaller as it reaches the center of the well
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);

  // 3. The Glow:
  // Light up the card when it hits the "Source" at the bottom of the well
  const filter = useTransform(
    scrollYProgress,
    [0.3, 0.5, 0.7],
    ["brightness(0.8)", "brightness(1.2) saturate(1.2)", "brightness(0.8)"]
  );

  return (
    <div
      ref={ref}
      className="relative h-[60vh] flex items-center justify-center perspective-1000"
    >
      {/* THE GRID BACKGROUND */}
      <div className="absolute inset-0 -z-10 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(60deg)]" />
      </div>

      <motion.div
        style={{ rotateX, rotateZ, scale, filter }}
        className="w-full max-w-md"
      >
        {children}
      </motion.div>
    </div>
  );
};
