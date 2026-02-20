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
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-[#00f5ff] to-[#8b00ff] bg-clip-text text-transparent">
              JAMESFIT AI
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-[#00f5ff]"
                      : "text-[#888] hover:text-[#f0f0f0] hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
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
              <div className="flex items-center gap-1 ml-3 px-2 py-1 rounded-full bg-gradient-to-r from-[#ff0033]/20 to-[#ff0033]/5 border border-[#ff0033]/20">
                <Flame className="w-3.5 h-3.5 text-[#ff0033]" />
                <span className="text-xs font-bold text-[#ff0033]">{streak}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
