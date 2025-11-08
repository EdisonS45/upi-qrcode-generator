import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowDown, Check, Zap, FileText, PieChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Reusable Animated Components ---
const FADE_DOWN = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeInOut' },
};

const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeInOut' },
  viewport: { once: true, amount: 0.3 },
};

// --- Main Landing Page Component ---
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      {/* --- 1. Hero Section --- */}
      <section className="relative w-full overflow-hidden bg-background">
        {/* Animated Aurora Background */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 size-full animate-aurora bg-[radial-gradient(125%_125%_at_50%_10%,theme(colors.white)_40%,theme(colors.primary/10)_100%)]"
          />
        </div>
        
        <div className="container relative z-10 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
          <motion.h1
            {...FADE_DOWN}
            className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl"
          >
            Invoicing that <span className="text-primary">finally</span> works.
          </motion.h1>
          <motion.p
            {...FADE_DOWN}
            transition={{ ...FADE_DOWN.transition, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Stop fighting with spreadsheets. Create beautiful, GST-compliant invoices with live previews and UPI QR codes in seconds.
          </motion.p>
          <motion.div
            {...FADE_DOWN}
            transition={{ ...FADE_DOWN.transition, delay: 0.4 }}
            className="mt-10 flex gap-4"
          >
            <Button size="lg" onClick={() => navigate('/register')}>
              Get Started for Free
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </motion.div>
          
          {/* Animated Scroll-Down Arrow */}
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 10 }}
            transition={{ delay: 1.5, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute bottom-10"
          >
            <ArrowDown className="h-6 w-6 text-muted-foreground" />
          </motion.div>
        </div>
      </section>

      {/* --- 2. "Image" Section (Fake UI) --- */}
      <section className="py-20 sm:py-32">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }} // Nice ease-out quad
            viewport={{ once: true, amount: 0.1 }}
            className="rounded-xl bg-gradient-to-br from-primary/20 via-white to-white p-4 shadow-2xl ring-1 ring-black/5"
          >
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* Fake Editor */}
              <div className="flex-1 rounded-lg border bg-background p-4">
                <div className="mb-4 text-sm font-medium">Bill To:</div>
                <div className="mb-2 h-9 w-full rounded bg-muted" />
                <div className="mb-4 h-9 w-2/3 rounded bg-muted" />
                <div className="mb-2 h-5 w-full rounded bg-muted" />
                <div className="h-5 w-full rounded bg-muted" />
              </div>
              {/* Fake Preview */}
              <div className="flex-1 rounded-lg border bg-background p-4">
                <div className="mb-4 text-sm font-medium">Preview:</div>
                <div className="mb-2 h-6 w-1/3 rounded bg-primary/20" />
                <div className="mb-2 h-4 w-full rounded bg-muted" />
                <div className="mb-4 h-4 w-2/3 rounded bg-muted" />
                <div className="mb-2 h-4 w-full rounded bg-muted" />
                <div className="h-4 w-1/2 rounded bg-muted" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* --- 3. Feature Grid --- */}
      <section className="bg-white py-20 sm:py-32">
        <div className="container">
          <motion.h2 {...FADE_UP} className="text-center text-3xl font-bold tracking-tight sm:text-5xl">
            Everything you need. Nothing you don't.
          </motion.h2>
          <motion.p {...FADE_UP} transition={{...FADE_UP.transition, delay: 0.2}} className="mt-6 text-center text-lg text-muted-foreground">
            Our powerful features make your invoicing workflow a breeze.
          </motion.p>

          <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Zap className="h-8 w-8 text-primary" />}
              title="Live Invoice Editor"
              description="See your PDF change in real-time as you type. No more guessing."
              delay={0}
            />
            <FeatureCard
              icon={<FileText className="h-8 w-8 text-primary" />}
              title="GST & UPI Ready"
              description="Automatically calculate CGST/SGST/IGST and add your UPI QR code for instant payments."
              delay={0.2}
            />
            <FeatureCard
              icon={<PieChart className="h-8 w-8 text-primary" />}
              title="Clean Dashboard"
              description="Track all your invoices, see what's paid, and what's overdue, all in one place."
              delay={0.4}
            />
          </div>
        </div>
      </section>
      
      {/* --- 4. Testimonial --- */}
      <section className="py-20 sm:py-32">
        <div className="container">
           <motion.figure {...FADE_UP} className="mx-auto max-w-3xl">
            <blockquote className="text-center text-2xl font-medium leading-9 text-foreground sm:text-3xl sm:leading-10">
              "This is the first invoicing tool that doesn't make me want to pull my hair out. I get a perfect invoice in 30 seconds. PayGen is a lifesaver."
            </blockquote>
            <figcaption className="mt-8 text-center">
              <div className="font-semibold text-foreground">Aarav Patel</div>
              <div className="text-muted-foreground">Freelance Developer</div>
            </figcaption>
          </motion.figure>
        </div>
      </section>

      {/* --- 5. Final CTA --- */}
      <section className="bg-white py-20 sm:py-32">
        <div className="container">
          <motion.div {...FADE_UP} className="relative overflow-hidden rounded-2xl bg-primary/10 px-6 py-20 shadow-xl sm:px-16 sm:py-24">
            {/* Gradient Blob */}
            <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                Start invoicing in seconds.
              </h2>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                No credit card required. Stop wasting time and start getting paid faster.
              </p>
              <Button size="lg" className="mt-10" onClick={() => navigate('/register')}>
                Sign Up for Free
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// --- Helper component for the feature cards ---
const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut', delay }}
      viewport={{ once: true, amount: 0.5 }}
      className="flex flex-col items-center text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        {icon}
      </div>
      <h3 className="mt-6 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </motion.div>
  );
};