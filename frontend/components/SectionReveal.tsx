'use client';

import { motion, useAnimation, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

type RevealFrom = 'left' | 'right' | 'up' | 'down' | 'scale';

const getInitial = (from: RevealFrom) => {
  if (from === 'left') return { opacity: 0, x: -40, y: 0, scale: 0.98 };
  if (from === 'right') return { opacity: 0, x: 40, y: 0, scale: 0.98 };
  if (from === 'up') return { opacity: 0, x: 0, y: -40, scale: 0.98 };
  if (from === 'down') return { opacity: 0, x: 0, y: 40, scale: 0.98 };
  return { opacity: 0, x: 0, y: 0, scale: 0.94 };
};

export default function SectionReveal({ children, from = 'left' }: { children: React.ReactNode; from?: RevealFrom }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { amount: 0.25 });

  useEffect(() => {
    if (isInView) {
      controls.start({ opacity: 1, x: 0, y: 0, scale: 1 });
    } else {
      controls.start(getInitial(from));
    }
  }, [controls, from, isInView]);

  return (
    <motion.div
      ref={ref}
      initial={getInitial(from)}
      animate={controls}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
