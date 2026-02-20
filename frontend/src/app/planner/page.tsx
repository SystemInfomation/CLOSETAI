"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, CalendarDays, Zap } from "lucide-react";
import { useWardrobeStore, Outfit } from "@/store/wardrobeStore";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function PlannerPage() {
  const { generateDailyOutfit, generateWeeklyOutfits, wearOutfit } = useWardrobeStore();
  const [mode, setMode] = useState<"daily" | "weekly">("daily");
  const [dailyOutfit, setDailyOutfit] = useState<Outfit | null>(null);
  const [weeklyOutfits, setWeeklyOutfits] = useState<Outfit[]>([]);
  const [generating, setGenerating] = useState(false);
  const [worn, setWorn] = useState<Set<string>>(new Set());

  const handleGenerateDaily = useCallback(() => {
    setGenerating(true);
    setTimeout(() => {
      const outfit = generateDailyOutfit();
      setDailyOutfit(outfit);
      setGenerating(false);
      if (outfit) {
        toast.success("Today's fire fit is ready 🔥");
      } else {
        toast.error("Add hoodies and shorts to your inventory first!");
      }
    }, 600);
  }, [generateDailyOutfit]);

  const handleGenerateWeekly = useCallback(() => {
    setGenerating(true);
    setTimeout(() => {
      const outfits = generateWeeklyOutfits();
      setWeeklyOutfits(outfits);
      setGenerating(false);
      if (outfits.length > 0) {
        toast.success(`${outfits.length} days of fire fits generated 🔥`);
      } else {
        toast.error("Add hoodies and shorts to your inventory first!");
      }
    }, 800);
  }, [generateWeeklyOutfits]);

  const handleWear = useCallback(
    (outfit: Outfit) => {
      wearOutfit(outfit);
      setWorn((prev) => new Set([...prev, outfit.date]));
      toast.success("Fit locked in! You're the best-dressed today 👑");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#00f5ff", "#8b00ff", "#39ff14", "#ff0033"],
      });
    },
    [wearOutfit]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-space)" }}
        >
          StyleForge{" "}
          <span className="bg-gradient-to-r from-[#39ff14] to-[#00f5ff] bg-clip-text text-transparent">
            Planner
          </span>
        </h1>
        <p className="text-[#666] mt-1">
          AI-powered outfit generation with perceptual color harmony
        </p>
      </motion.div>

      {/* Mode Toggle */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/5">
          <button
            onClick={() => setMode("daily")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              mode === "daily"
                ? "bg-[#39ff14]/15 text-[#39ff14]"
                : "text-[#888] hover:text-white"
            )}
          >
            <Zap className="w-4 h-4" />
            Daily
          </button>
          <button
            onClick={() => setMode("weekly")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              mode === "weekly"
                ? "bg-[#8b00ff]/15 text-[#8b00ff]"
                : "text-[#888] hover:text-white"
            )}
          >
            <CalendarDays className="w-4 h-4" />
            Weekly
          </button>
        </div>

        <Button
          variant="primary-lime"
          size="lg"
          onClick={mode === "daily" ? handleGenerateDaily : handleGenerateWeekly}
          loading={generating}
          aria-label={mode === "daily" ? "Generate daily outfit" : "Generate weekly outfits"}
        >
          {!generating && <Sparkles className="w-4 h-4" />}
          {generating
            ? "Generating..."
            : mode === "daily"
            ? "Generate Today's Fire Fit"
            : "Generate Full Week"}
        </Button>
      </div>

      {/* Loading Skeleton */}
      {generating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={mode === "daily" ? "max-w-2xl mx-auto" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"}
        >
          {Array.from({ length: mode === "daily" ? 1 : 5 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl border border-white/5 overflow-hidden animate-pulse">
              <div className="px-4 py-2 border-b border-white/5">
                <div className="h-3 w-20 bg-white/10 rounded" />
              </div>
              <div className="flex h-24">
                <div className="flex-1 bg-white/5" />
                <div className="w-px bg-black/20" />
                <div className="flex-1 bg-white/5" />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-white/5" />
                  <div className="w-20 h-20 rounded-full bg-white/5" />
                </div>
                <div className="h-4 bg-white/5 rounded w-3/4 mx-auto" />
                <div className="h-10 bg-white/5 rounded-xl" />
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Daily Mode */}
      <AnimatePresence mode="wait">
        {mode === "daily" && dailyOutfit && !generating && (
          <motion.div
            key="daily"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <OutfitCard
              outfit={dailyOutfit}
              onWear={() => handleWear(dailyOutfit)}
              isWorn={worn.has(dailyOutfit.date)}
              large
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Mode */}
      <AnimatePresence mode="wait">
        {mode === "weekly" && weeklyOutfits.length > 0 && !generating && (
          <motion.div
            key="weekly"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
          >
            {weeklyOutfits.map((outfit, i) => (
              <motion.div
                key={outfit.dayOfWeek}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <OutfitCard
                  outfit={outfit}
                  onWear={() => handleWear(outfit)}
                  isWorn={worn.has(outfit.date)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {mode === "daily" && !dailyOutfit && !generating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#39ff14]/5 border border-[#39ff14]/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-[#39ff14]/40" />
          </div>
          <p className="text-[#888] text-lg font-medium" style={{ fontFamily: "var(--font-space)" }}>Ready to generate your fit?</p>
          <p className="text-[#555] text-sm mt-1">
            Hit the button above and let StyleForge AI cook 🔥
          </p>
        </motion.div>
      )}

      {mode === "weekly" && weeklyOutfits.length === 0 && !generating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#8b00ff]/5 border border-[#8b00ff]/10 flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="w-8 h-8 text-[#8b00ff]/40" />
          </div>
          <p className="text-[#888] text-lg font-medium" style={{ fontFamily: "var(--font-space)" }}>Plan your whole week</p>
          <p className="text-[#555] text-sm mt-1">
            Generate 5 days of optimized outfits with zero repeats
          </p>
        </motion.div>
      )}
    </div>
  );
}

function OutfitCard({
  outfit,
  onWear,
  isWorn,
  large = false,
}: {
  outfit: Outfit;
  onWear: () => void;
  isWorn: boolean;
  large?: boolean;
}) {
  const circumference = 2 * Math.PI * 36;
  const harmonyOffset = circumference - (outfit.harmonyScore / 100) * circumference;
  const dripOffset = circumference - (outfit.dripScore / 100) * circumference;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "glass rounded-2xl border border-white/5 hover:border-[#39ff14]/20 transition-all overflow-hidden",
        large ? "max-w-2xl mx-auto" : ""
      )}
    >
      {/* Day header */}
      <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#888]">
          {outfit.dayOfWeek}
        </span>
        <span
          className={cn(
            "text-[10px] font-medium px-2 py-0.5 rounded-full",
            outfit.harmonyType === "complementary"
              ? "bg-[#39ff14]/15 text-[#39ff14]"
              : outfit.harmonyType === "analogous"
              ? "bg-[#00f5ff]/15 text-[#00f5ff]"
              : "bg-[#8b00ff]/15 text-[#8b00ff]"
          )}
        >
          {outfit.harmonyType}
        </span>
      </div>

      {/* Color Display */}
      <div className={cn("flex", large ? "h-40" : "h-24")}>
        <div
          className="flex-1 relative group"
          style={{ backgroundColor: outfit.hoodie.primaryHex }}
        >
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-[10px] font-medium text-white/80 drop-shadow truncate">
              {outfit.hoodie.name}
            </p>
            <p className="text-[8px] text-white/50 font-mono">
              {outfit.hoodie.primaryHex}
            </p>
          </div>
        </div>
        <div className="w-px bg-black/20" />
        <div
          className="flex-1 relative group"
          style={{ backgroundColor: outfit.shorts.primaryHex }}
        >
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-[10px] font-medium text-white/80 drop-shadow truncate">
              {outfit.shorts.name}
            </p>
            <p className="text-[8px] text-white/50 font-mono">
              {outfit.shorts.primaryHex}
            </p>
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="p-4">
        <div className="flex items-center justify-center gap-6 mb-4">
          {/* Harmony Score Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 drip-score-ring" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="#222"
                  strokeWidth="4"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="#00f5ff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={harmonyOffset}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-lg font-bold text-[#00f5ff]"
                  style={{ fontFamily: "var(--font-space)" }}
                >
                  {outfit.harmonyScore}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-[#666] mt-1">Harmony</span>
          </div>

          {/* Drip Score Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 drip-score-ring" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="#222"
                  strokeWidth="4"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="#39ff14"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dripOffset}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-lg font-bold text-[#39ff14]"
                  style={{ fontFamily: "var(--font-space)" }}
                >
                  {outfit.dripScore}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-[#666] mt-1">Drip Score</span>
          </div>
        </div>

        {/* Explanation */}
        <p className={cn("text-sm text-[#aaa] leading-relaxed mb-4", large ? "" : "line-clamp-3")}>
          {outfit.explanation}
        </p>

        {/* Wear button */}
        <Button
          variant={isWorn ? "secondary" : "primary-lime"}
          size={large ? "lg" : "md"}
          onClick={onWear}
          disabled={isWorn}
          className="w-full"
        >
          {isWorn ? (
            <Check className="w-4 h-4" />
          ) : null}
          {isWorn ? "Locked In ✅" : "Wear It 🔥"}
        </Button>
      </div>
    </motion.div>
  );
}
