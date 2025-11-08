import React from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility
import { motion } from 'framer-motion';

// This component acts as a placeholder for a real app screenshot.
// You can replace its content or the image it uses later.
export default function AppScreenshot({ className }) {
  const screenshotSrc = "https://via.placeholder.com/1400x800/5e35b1/ffffff?text=Your+App+UI+Screenshot+Goes+Here"; // Placeholder image
  
  // A sleek, minimal browser frame style
  const browserFrameVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } },
  };

  return (
    <motion.div
      className={cn(
        "relative rounded-xl border border-border bg-white shadow-2xl overflow-hidden",
        className
      )}
      variants={browserFrameVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Browser address bar / controls */}
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/20 border-b border-border">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
        </div>
        <div className="flex-grow text-center">
          <div className="mx-auto h-6 w-full max-w-xs rounded-md bg-muted text-xs text-muted-foreground flex items-center justify-center">
            app.paygen.com/dashboard
          </div>
        </div>
      </div>

      {/* Actual Screenshot/UI Placeholder */}
      <div className="relative aspect-[16/9] w-full">
        <img
          src={screenshotSrc}
          alt="PayGen App Dashboard Screenshot"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Optional: Overlay a subtle gradient to make it pop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
      </div>
    </motion.div>
  );
}