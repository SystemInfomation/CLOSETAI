"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shirt, Sparkles, Flame, TrendingUp } from "lucide-react";
import { useWardrobeStore } from "@/store/wardrobeStore";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function HomePage() {
  const { items, outfitHistory, streak } = useWardrobeStore();

  const stats = useMemo(() => {
    const hoodies = items.filter((i) => i.type === "hoodie").length;
    const shorts = items.filter((i) => i.type === "shorts").length;
    const combos = hoodies * shorts;
    const avgHarmony =
      outfitHistory.length > 0
        ? Math.round(
            outfitHistory.reduce((s, h) => s + h.outfit.harmonyScore, 0) /
              outfitHistory.length
          )
        : 0;
    return { avgHarmony, combos, streak };
  }, [items, outfitHistory, streak]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 text-center overflow-hidden">
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,255,0.08)_0%,transparent_70%)]" />
        
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto"
        >
          <motion.div variants={fadeIn} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/20 mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Powered by AI + Perceptual Color Science
            </span>
          </motion.div>

          <motion.h1
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-[140px] font-bold leading-[0.9] tracking-tighter mb-4"
            style={{ fontFamily: "var(--font-space)" }}
          >
            <span className="bg-gradient-to-r from-[#00f5ff] via-[#8b00ff] to-[#00f5ff] bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
              CLOSET
            </span>
            <br />
            <span className="text-white">AI</span>
          </motion.h1>

          <motion.p
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl md:text-3xl font-medium text-[#888] mt-4 mb-2"
          >
            Your Wardrobe.{" "}
            <span className="text-[#00f5ff] glow-cyan">Now Sentient.</span>
          </motion.p>

          <motion.p
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-sm sm:text-base text-[#666] max-w-xl mx-auto mt-4 mb-10 leading-relaxed"
          >
            Daily color-perfect athletic fits engineered for your exact drip.
            Zero decision fatigue. Maximum confidence.
          </motion.p>

          <motion.div
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/inventory">
              <Button variant="primary" size="xl">
                <Shirt className="w-5 h-5" />
                Build My Inventory
              </Button>
            </Link>
            <Link href="/planner">
              <Button variant="secondary" size="xl">
                See Today&apos;s Locked-In Fit
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4 border-t border-white/5">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-[#00f5ff]" />}
              value={stats.avgHarmony > 0 ? `${stats.avgHarmony}%` : "—"}
              label="Avg Harmony Score"
              color="cyan"
            />
            <StatCard
              icon={<Shirt className="w-5 h-5 text-[#8b00ff]" />}
              value={stats.combos > 0 ? String(stats.combos) : "—"}
              label="Outfit Combinations"
              color="violet"
            />
            <StatCard
              icon={<Flame className="w-5 h-5 text-[#ff0033]" />}
              value={stats.streak > 0 ? String(stats.streak) : "—"}
              label="Day Drip Streak"
              color="red"
            />
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-[#555]">
              Add items to your{" "}
              <Link href="/inventory" className="text-[#888] hover:text-[#00f5ff] transition-colors">inventory</Link>
              {" "}to get started
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: "cyan" | "violet" | "red";
}) {
  const glowClass = {
    cyan: "box-glow-cyan border-[#00f5ff]/10",
    violet: "box-glow-violet border-[#8b00ff]/10",
    red: "border-[#ff0033]/10",
  }[color];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={`glass rounded-2xl p-6 border ${glowClass} transition-all`}
    >
      <div className="flex items-center gap-3 mb-3">{icon}</div>
      <p className="text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-space)" }}>
        {value}
      </p>
      <p className="text-sm text-[#666] mt-1">{label}</p>
    </motion.div>
  );
}
