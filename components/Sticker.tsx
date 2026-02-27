
import React, { useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface StickerProps {
  children: React.ReactNode;
  x: string;
  y: string;
  rotate: number;
  delay: number;
  color: string;
  shape: string;
}

const Sticker: React.FC<StickerProps> = ({ children, x, y, rotate, delay, color, shape }) => {
  const { scrollY } = useScroll();

  const { targetFallY, driftX, rotationIntensity } = useMemo(() => ({
    targetFallY: 75 + (Math.random() * 13),
    driftX: (Math.random() - 0.5) * 60,
    rotationIntensity: 0.05 + Math.random() * 0.1
  }), []);

  const startYPercent = useMemo(() => parseFloat(y) || 0, [y]);
  const distanceToFall = useMemo(() => Math.max(0, targetFallY - startYPercent), [targetFallY, startYPercent]);

  // 更轻的弹簧配置，减少抖动
  const springConfig = { stiffness: 30, damping: 20, mass: 1 };

  const yFall = useTransform(scrollY, [0, 500], ["0vh", `${distanceToFall}vh`]);
  const springY = useSpring(yFall, springConfig);

  const xDrift = useTransform(scrollY, [0, 500], [0, driftX]);
  const springX = useSpring(xDrift, springConfig);

  const dynamicRotate = useTransform(scrollY, v => rotate + v * rotationIntensity);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: rotate + 45 }}
      animate={{ scale: 1, opacity: 1, rotate: rotate }}
      style={{
        left: x,
        top: y,
        y: springY,
        x: springX,
        rotate: dynamicRotate,
      }}
      transition={{
        delay: delay,
        type: "spring",
        stiffness: 120,
        damping: 12
      }}
      className={`absolute z-10 flex items-center justify-center font-black text-lg md:text-2xl uppercase tracking-wider shadow-[8px_8px_0px_rgba(0,0,0,0.3)] border-4 border-black cursor-pointer hover:scale-110 hover:z-50 transition-transform ${color} ${shape} whitespace-nowrap px-8 py-4`}
    >
      <div className="pointer-events-none select-none">
        {children}
      </div>
    </motion.div>
  );
};

export default Sticker;
