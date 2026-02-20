"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, ShirtIcon, CalendarDays, BarChart3, Flame } from "lucide-react";
import { useWardrobeStore } from "@/store/wardrobeStore";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/inventory", label: "Inventory", icon: ShirtIcon },
  { href: "/planner", label: "Planner", icon: CalendarDays },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Navigation() {
  const pathname = usePathname();
  const streak = useWardrobeStore((s) => s.streak);

  return (
    <>
      {/* Desktop / Top Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2" aria-label="ClosetAI Home">
              <span className="text-xl font-bold bg-gradient-to-r from-[#00f5ff] to-[#8b00ff] bg-clip-text text-transparent">
                CLOSET AI
              </span>
            </Link>

            {/* Desktop nav items */}
            <div className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "text-[#00f5ff]"
                        : "text-[#888] hover:text-[#f0f0f0] hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-lg bg-[#00f5ff]/10 border border-[#00f5ff]/20"
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                  </Link>
                );
              })}

              {streak > 0 && (
                <div className="flex items-center gap-1 ml-3 px-2 py-1 rounded-full bg-gradient-to-r from-[#ff0033]/20 to-[#ff0033]/5 border border-[#ff0033]/20" aria-label={`${streak} day streak`}>
                  <Flame className="w-3.5 h-3.5 text-[#ff0033]" />
                  <span className="text-xs font-bold text-[#ff0033]">{streak}</span>
                </div>
              )}
            </div>

            {/* User avatar */}
            <div className="flex items-center gap-3">
              {streak > 0 && (
                <div className="flex sm:hidden items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-[#ff0033]/20 to-[#ff0033]/5 border border-[#ff0033]/20" aria-label={`${streak} day streak`}>
                  <Flame className="w-3.5 h-3.5 text-[#ff0033]" />
                  <span className="text-xs font-bold text-[#ff0033]">{streak}</span>
                </div>
              )}
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00f5ff] to-[#8b00ff] flex items-center justify-center text-xs font-bold text-black"
                aria-label="User avatar"
              >
                J
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden glass border-t border-white/5" role="navigation" aria-label="Mobile navigation">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px]",
                  isActive
                    ? "text-[#00f5ff]"
                    : "text-[#555] active:text-[#888]"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-0 rounded-xl bg-[#00f5ff]/8 border border-[#00f5ff]/15"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
              </Link>
            );
          })}
          {/* Fire Streak in mobile nav */}
          <div
            className={cn(
              "relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-[56px]",
              streak > 0 ? "text-[#ff0033]" : "text-[#333]"
            )}
            aria-label={`${streak} day drip streak`}
          >
            <Flame className="w-5 h-5" />
            <span className="text-[10px] font-bold">{streak > 0 ? streak : "—"}</span>
          </div>
        </div>
      </nav>
    </>
  );
}
