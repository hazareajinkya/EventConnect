'use client';

import { motion } from 'framer-motion';

export const Scanner = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      <motion.div
        initial={{ top: '-10%' }}
        animate={{ top: '110%' }}
        transition={{
          duration: 2.5,
          ease: 'linear',
          repeat: Infinity,
          repeatDelay: 1,
        }}
        className="absolute w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-cyan)] to-transparent opacity-50 shadow-[0_0_15px_var(--color-cyan)]"
      />
    </div>
  );
};
