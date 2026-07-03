"use client";

import { AnimatePresence, motion } from "framer-motion";

type ReconnectingBannerProps = {
  show: boolean;
};

export function ReconnectingBanner({ show }: ReconnectingBannerProps) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="mb-4 rounded-card border border-pos-orange/20 bg-pos-orange/10 px-4 py-3 text-sm font-bold text-pos-orange"
        >
          Reconnecting to live data...
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
