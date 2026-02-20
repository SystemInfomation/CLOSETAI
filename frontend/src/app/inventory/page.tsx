"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Search, Tag, ShirtIcon, X } from "lucide-react";
import { useWardrobeStore, ClothingItem } from "@/store/wardrobeStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type FilterTab = "all" | "hoodie" | "shorts";

export default function InventoryPage() {
  const { items, addItem, removeItem } = useWardrobeStore();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    if (activeTab !== "all" && item.type !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !item.name.toLowerCase().includes(q) &&
        !item.brand.toLowerCase().includes(q) &&
        !item.primaryHex.toLowerCase().includes(q)
      )
        return false;
    }
    if (selectedTag && !item.tags.includes(selectedTag)) return false;
    return true;
  });

  const allTags = [...new Set(items.flatMap((i) => i.tags))];
  const hoodies = items.filter((i) => i.type === "hoodie");
  const shorts = items.filter((i) => i.type === "shorts");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Wardrobe{" "}
            <span className="bg-gradient-to-r from-[#00f5ff] to-[#8b00ff] bg-clip-text text-transparent">
              Inventory
            </span>
          </h1>
          <p className="text-[#666] mt-1">
            {items.length} items • {hoodies.length} hoodies • {shorts.length}{" "}
            shorts
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          aria-label="Add new clothing item"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#00c8d6] text-black font-bold text-sm box-glow-cyan"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </motion.button>
      </motion.div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/5">
          {(["all", "hoodie", "shorts"] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize",
                activeTab === tab
                  ? "bg-[#00f5ff]/15 text-[#00f5ff]"
                  : "text-[#888] hover:text-white"
              )}
            >
              {tab === "all" ? "All" : tab === "hoodie" ? "Hoodies" : "Shorts"}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
          <input
            type="text"
            placeholder="Search by name, brand, or hex..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#00f5ff]/30"
          />
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                setSelectedTag(selectedTag === tag ? null : tag)
              }
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all border",
                selectedTag === tag
                  ? "bg-[#8b00ff]/20 border-[#8b00ff]/30 text-[#8b00ff]"
                  : "bg-white/5 border-white/5 text-[#888] hover:text-white"
              )}
            >
              <Tag className="w-3 h-3" />
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <ClothingCard
              key={item.id}
              item={item}
              onDelete={() => {
                removeItem(item.id);
                toast.success(`Removed "${item.name}" from wardrobe`);
              }}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <ShirtIcon className="w-8 h-8 text-[#444]" />
          </div>
          <p className="text-[#888] text-lg font-medium" style={{ fontFamily: "var(--font-space)" }}>No items found</p>
          <p className="text-[#555] text-sm mt-1 mb-6">
            {items.length === 0 ? "Start building your wardrobe arsenal" : "Try adjusting your filters"}
          </p>
          {items.length === 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              aria-label="Add your first clothing item"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#00c8d6] text-black font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Your First Item
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddItemModal onClose={() => setShowAddModal(false)} onAdd={(item) => {
            addItem(item);
            toast.success(`Added "${item.name}" to wardrobe 🔥`);
          }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ClothingCard({
  item,
  onDelete,
}: {
  item: ClothingItem;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="group relative glass rounded-xl overflow-hidden border border-white/5 hover:border-[#00f5ff]/20 transition-all"
    >
      {/* Color swatch header */}
      <div
        className="h-24 w-full relative"
        style={{ backgroundColor: item.primaryHex }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#161616]" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 text-white/60 opacity-0 group-hover:opacity-100 hover:text-[#ff0033] transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <div className="absolute bottom-2 left-2">
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-white/70">
            {item.primaryHex}
          </span>
        </div>
      </div>

      <div className="p-3">
        <p className="text-sm font-medium text-white truncate">{item.name}</p>
        <p className="text-xs text-[#666] mt-0.5">{item.brand}</p>

        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] uppercase tracking-wider text-[#555]">
            {item.type}
          </span>
          <span className="text-[10px] text-[#555]">
            Worn {item.wearCount}x
          </span>
        </div>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-[#666]"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 2 && (
              <span className="text-[9px] text-[#555]">
                +{item.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AddItemModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (item: Omit<ClothingItem, "id" | "wearCount" | "lastWorn" | "createdAt">) => void;
}) {
  const [type, setType] = useState<"hoodie" | "shorts">("hoodie");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [primaryHex, setPrimaryHex] = useState("#1a1a1a");
  const [tags, setTags] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      type,
      name: name.trim(),
      brand: brand.trim(),
      primaryHex,
      palette: [primaryHex],
      imageUrls: [],
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Add new clothing item"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass rounded-2xl border border-white/10 p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Add New{" "}
            <span className="text-[#00f5ff]">Item</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-[#666]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-xs text-[#888] mb-1.5 uppercase tracking-wider">
              Type
            </label>
            <div className="flex gap-2">
              {(["hoodie", "shorts"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg text-sm font-medium border transition-all capitalize",
                    type === t
                      ? "bg-[#00f5ff]/15 border-[#00f5ff]/30 text-[#00f5ff]"
                      : "bg-white/5 border-white/5 text-[#888] hover:text-white"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs text-[#888] mb-1.5 uppercase tracking-wider">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nike Tech Fleece Black"
              required
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#00f5ff]/30"
            />
          </div>

          {/* Brand */}
          <div>
            <label className="block text-xs text-[#888] mb-1.5 uppercase tracking-wider">
              Brand
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Nike"
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#00f5ff]/30"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs text-[#888] mb-1.5 uppercase tracking-wider">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryHex}
                onChange={(e) => setPrimaryHex(e.target.value)}
                className="w-12 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={primaryHex}
                onChange={(e) => setPrimaryHex(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm font-mono text-white focus:outline-none focus:border-[#00f5ff]/30"
              />
              <div
                className="w-10 h-10 rounded-lg border border-white/10"
                style={{ backgroundColor: primaryHex }}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs text-[#888] mb-1.5 uppercase tracking-wider">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="school-safe, favorite, gym-only"
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#00f5ff]/30"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#00c8d6] text-black font-bold text-sm"
          >
            Add to Wardrobe
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
