"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useWardrobeStore } from "@/store/wardrobeStore";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Shirt,
  TrendingUp,
  Flame,
  Trophy,
  Palette,
  Star,
  Crown,
  Zap,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hexToHSL } from "@/lib/colorHarmony";

function getColorFamily(hex: string): string {
  const hsl = hexToHSL(hex);
  if (hsl.s < 15) return "Neutral";
  if (hsl.h >= 180 && hsl.h <= 300) return "Cool";
  if (hsl.h >= 0 && hsl.h < 60) return "Warm";
  if (hsl.h >= 60 && hsl.h < 180) return "Earth";
  return "Warm";
}

export default function AnalyticsPage() {
  const { items, outfitHistory, streak } = useWardrobeStore();

  const stats = useMemo(() => {
    const hoodies = items.filter((i) => i.type === "hoodie");
    const shorts = items.filter((i) => i.type === "shorts");
    const totalWears = outfitHistory.length;
    const avgHarmony =
      totalWears > 0
        ? Math.round(
            outfitHistory.reduce((s, h) => s + h.outfit.harmonyScore, 0) /
              totalWears
          )
        : 0;
    const avgDrip =
      totalWears > 0
        ? Math.round(
            outfitHistory.reduce((s, h) => s + h.outfit.dripScore, 0) /
              totalWears
          )
        : 0;

    // Color distribution
    const colorDist: Record<string, number> = {
      Cool: 0,
      Warm: 0,
      Neutral: 0,
      Earth: 0,
    };
    items.forEach((item) => {
      const family = getColorFamily(item.primaryHex);
      colorDist[family]++;
    });

    const colorData = Object.entries(colorDist).map(([name, count]) => ({
      name,
      count,
      fill:
        name === "Cool"
          ? "#00f5ff"
          : name === "Warm"
          ? "#ff0033"
          : name === "Earth"
          ? "#39ff14"
          : "#888888",
    }));

    // Most worn
    const mostWorn = [...items].sort(
      (a, b) => b.wearCount - a.wearCount
    )[0];

    // Wardrobe health
    const healthScore = Math.min(
      100,
      Math.round(
        (hoodies.length >= 5 ? 25 : hoodies.length * 5) +
          (shorts.length >= 5 ? 25 : shorts.length * 5) +
          (Object.values(colorDist).filter((v) => v > 0).length / 4) * 25 +
          Math.min(totalWears * 2, 25)
      )
    );

    const suggestions: string[] = [];
    if (colorDist.Cool < 2) suggestions.push("Add more cool-tone pieces (blues, purples, teals) – they look 🔥 on fair cool skin");
    if (colorDist.Warm < 2) suggestions.push("Consider 1-2 warm accent pieces for variety");
    if (hoodies.length < 5) suggestions.push("Add more hoodies for better weekly rotation");
    if (shorts.length < 4) suggestions.push("Expand your shorts collection for more combo options");
    if (totalWears === 0) suggestions.push("Start logging your outfits to build your drip streak!");

    return {
      total: items.length,
      hoodies: hoodies.length,
      shorts: shorts.length,
      totalWears,
      avgHarmony,
      avgDrip,
      colorData,
      mostWorn,
      healthScore,
      suggestions,
    };
  }, [items, outfitHistory]);

  // Badges
  const badges = useMemo(() => {
    const earned: { name: string; icon: React.ReactNode; earned: boolean; desc: string }[] = [
      {
        name: "First Fit",
        icon: <Star className="w-5 h-5" />,
        earned: outfitHistory.length >= 1,
        desc: "Log your first outfit",
      },
      {
        name: "Color Alchemist",
        icon: <Palette className="w-5 h-5" />,
        earned: outfitHistory.some((h) => h.outfit.harmonyScore >= 90),
        desc: "Achieve 90+ harmony score",
      },
      {
        name: "Variety God",
        icon: <Target className="w-5 h-5" />,
        earned: new Set(outfitHistory.map((h) => h.outfit.hoodie.id)).size >= 5,
        desc: "Wear 5 different hoodies",
      },
      {
        name: "Drip Lord",
        icon: <Crown className="w-5 h-5" />,
        earned: streak >= 7,
        desc: "7-day drip streak",
      },
      {
        name: "Heat Check",
        icon: <Flame className="w-5 h-5" />,
        earned: streak >= 3,
        desc: "3-day drip streak",
      },
      {
        name: "Full Arsenal",
        icon: <Zap className="w-5 h-5" />,
        earned: items.length >= 15,
        desc: "Own 15+ items",
      },
    ];
    return earned;
  }, [outfitHistory, streak, items.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-space)" }}
        >
          Drip{" "}
          <span className="bg-gradient-to-r from-[#ff0033] to-[#8b00ff] bg-clip-text text-transparent">
            Analytics
          </span>
        </h1>
        <p className="text-[#666] mt-1">
          Your wardrobe intelligence dashboard
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <StatCard
          icon={<Shirt className="w-4 h-4 text-[#00f5ff]" />}
          value={stats.total}
          label="Total Items"
        />
        <StatCard
          icon={<Shirt className="w-4 h-4 text-[#8b00ff]" />}
          value={stats.hoodies}
          label="Hoodies"
        />
        <StatCard
          icon={<Shirt className="w-4 h-4 text-[#39ff14]" />}
          value={stats.shorts}
          label="Shorts"
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4 text-[#00f5ff]" />}
          value={stats.avgHarmony}
          label="Avg Harmony"
        />
        <StatCard
          icon={<Trophy className="w-4 h-4 text-[#39ff14]" />}
          value={stats.avgDrip}
          label="Avg Drip"
        />
        <StatCard
          icon={<Flame className="w-4 h-4 text-[#ff0033]" />}
          value={streak}
          label="Day Streak"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Color Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl border border-white/5 p-6"
        >
          <h3
            className="text-sm font-bold text-[#888] uppercase tracking-wider mb-4"
          >
            Color Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.colorData}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#666", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#666", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#161616",
                  border: "1px solid #222",
                  borderRadius: "8px",
                  color: "#f0f0f0",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {stats.colorData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Wardrobe Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl border border-white/5 p-6"
        >
          <h3 className="text-sm font-bold text-[#888] uppercase tracking-wider mb-4">
            Wardrobe Health
          </h3>
          <div className="flex items-center gap-6 mb-4">
            <div className="relative w-24 h-24">
              <svg
                className="w-24 h-24 drip-score-ring"
                viewBox="0 0 80 80"
              >
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="#222"
                  strokeWidth="6"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke={
                    stats.healthScore >= 80
                      ? "#39ff14"
                      : stats.healthScore >= 50
                      ? "#00f5ff"
                      : "#ff0033"
                  }
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 36}
                  strokeDashoffset={
                    2 * Math.PI * 36 -
                    (stats.healthScore / 100) * 2 * Math.PI * 36
                  }
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "var(--font-space)",
                    color:
                      stats.healthScore >= 80
                        ? "#39ff14"
                        : stats.healthScore >= 50
                        ? "#00f5ff"
                        : "#ff0033",
                  }}
                >
                  {stats.healthScore}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#aaa] mb-2">
                {stats.healthScore >= 80
                  ? "Your wardrobe is in elite shape 🔥"
                  : stats.healthScore >= 50
                  ? "Good foundation, room to level up"
                  : "Time to expand your arsenal"}
              </p>
              <div className="space-y-1.5">
                {stats.suggestions.slice(0, 3).map((s, i) => (
                  <p key={i} className="text-xs text-[#666]">
                    • {s}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl border border-white/5 p-6 mb-8"
      >
        <h3 className="text-sm font-bold text-[#888] uppercase tracking-wider mb-4">
          Badges & Achievements
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.name}
              className={cn(
                "flex flex-col items-center text-center p-4 rounded-xl border transition-all",
                badge.earned
                  ? "glass border-[#39ff14]/20 text-[#39ff14]"
                  : "border-white/5 text-[#333]"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-lg mb-2",
                  badge.earned ? "bg-[#39ff14]/10" : "bg-white/5"
                )}
              >
                {badge.icon}
              </div>
              <p className="text-xs font-bold">{badge.name}</p>
              <p className={cn("text-[10px] mt-0.5", badge.earned ? "text-[#39ff14]/60" : "text-[#444]")}>
                {badge.desc}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl border border-white/5 p-6"
      >
        <h3 className="text-sm font-bold text-[#888] uppercase tracking-wider mb-4">
          Recent Outfit History
        </h3>
        {outfitHistory.length === 0 ? (
          <p className="text-[#555] text-sm">
            No outfits logged yet. Go to the Planner and hit &quot;Wear It&quot; to start
            building your history!
          </p>
        ) : (
          <div className="space-y-3">
            {outfitHistory.slice(0, 10).map((entry, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <div className="flex gap-1">
                  <div
                    className="w-8 h-8 rounded-lg"
                    style={{
                      backgroundColor: entry.outfit.hoodie.primaryHex,
                    }}
                  />
                  <div
                    className="w-8 h-8 rounded-lg"
                    style={{
                      backgroundColor: entry.outfit.shorts.primaryHex,
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    {entry.outfit.hoodie.name} +{" "}
                    {entry.outfit.shorts.name}
                  </p>
                  <p className="text-xs text-[#555]">
                    {entry.outfit.dayOfWeek} •{" "}
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[#00f5ff]">
                    H:{entry.outfit.harmonyScore}
                  </span>
                  <span className="text-[#39ff14]">
                    D:{entry.outfit.dripScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all"
    >
      <div className="mb-2">{icon}</div>
      <p
        className="text-2xl font-bold"
        style={{ fontFamily: "var(--font-space)" }}
      >
        {value}
      </p>
      <p className="text-[10px] text-[#666] uppercase tracking-wider">
        {label}
      </p>
    </motion.div>
  );
}
