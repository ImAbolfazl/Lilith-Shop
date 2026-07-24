import { useState } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate, useTransform } from "framer-motion";

export default function MaskRevealText({ baseText, revealText, radius = 60 }) {
    const [hovering, setHovering] = useState(false);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 300, damping: 30 });
    const springY = useSpring(y, { stiffness: 300, damping: 30 });
    const circleX = useTransform(springX, (v) => v - radius);
    const circleY = useTransform(springY, (v) => v - radius);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left);
        y.set(e.clientY - rect.top);
    };

    const clipPath = useMotionTemplate`circle(${hovering ? radius : 0}px at ${springX}px ${springY}px)`;

    return (
        <span
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className="relative inline-block cursor-pointer overflow-visible"
        >
      <span className="text-accent-primary">{baseText}</span>

      <motion.span
          className="absolute top-0 left-0 rounded-full bg-bg-secondary pointer-events-none z-0"
          style={{
              width: radius * 2,
              height: radius * 2,
              x: circleX,
              y: circleY,
              opacity: hovering ? 1 : 0,
          }}
      />

      <motion.span
          className="absolute inset-0 text-accent-primary pointer-events-none whitespace-nowrap flex items-center justify-center z-10"
          style={{ clipPath, opacity: hovering ? 1 : 0 }}
      >
        {revealText}
      </motion.span>
    </span>
    );
}