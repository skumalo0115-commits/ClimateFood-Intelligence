'use client';

import { motion } from 'framer-motion';

export default function SectionReveal({ children, from = 'left' }: { children: React.ReactNode; from?: 'left' | 'right' }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: from === 'left' ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}
