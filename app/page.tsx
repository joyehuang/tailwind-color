"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Heart, ChevronDown, Search, X, Copy, Grid3X3, List } from "lucide-react";
import { tailwindColors, colorCategories, shadeLabels } from "@/lib/tailwind-colors";
import { ColorRow } from "@/components/color-row";
import { ColorDetailPanel } from "@/components/color-detail-panel";
import { FavoritesPanel } from "@/components/favorites-panel";
import { CopyToast } from "@/components/copy-toast";
import { ShadeTips } from "@/components/shade-tips";
import type { ColorShade } from "@/lib/tailwind-colors";

type CopyFormat = "hex" | "oklch" | "tailwind" | "css-var";
type ViewMode = "grid" | "list";

const FORMAT_OPTIONS: { value: CopyFormat; label: string; shortLabel: string }[] = [
  { value: "hex", label: "HEX", shortLabel: "HEX" },
  { value: "oklch", label: "OKLCH", shortLabel: "OKLCH" },
  { value: "tailwind", label: "Tailwind Class", shortLabel: "Class" },
  { value: "css-var", label: "CSS Variable", shortLabel: "CSS" },
];

export default function TailwindColorsPage() {
  const [search, setSearch] = useState("");
  const [copyFormat, setCopyFormat] = useState<CopyFormat>("hex");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });
  const [detailShade, setDetailShade] = useState<ColorShade | null>(null);
  const [detailColorName, setDetailColorName] = useState<string | null>(null);
  const [formatDropdownOpen, setFormatDropdownOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tw-color-favorites");
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("tw-color-favorites", JSON.stringify(Array.from(favorites)));
    } catch {
      // ignore
    }
  }, [favorites]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFormatDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleCopy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message: `已复制 ${label}`, visible: true });
    toastTimer.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2000);
  }, []);

  const handleToggleFavorite = useCallback((key: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const filteredColors = useMemo(() => {
    if (!search.trim()) return tailwindColors;
    const q = search.toLowerCase().trim();
    return tailwindColors.filter(
      (group) =>
        group.name.toLowerCase().includes(q) ||
        group.label.toLowerCase().includes(q) ||
        group.shades.some((s) => s.hex.toLowerCase().includes(q))
    );
  }, [search]);

  const colorGroups = useMemo(() => {
    if (search.trim()) {
      return [{ label: `搜索结果 (${filteredColors.length})`, colors: filteredColors }];
    }
    return colorCategories.map((cat) => ({
      label: cat.label,
      colors: tailwindColors.filter((c) => cat.colors.includes(c.name)),
    }));
  }, [search, filteredColors]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          {/* Top Row: Branding + Actions */}
          <div className="flex items-center justify-between h-12 sm:h-14">
            <div className="flex items-center gap-3">
              {/* Color bar logo */}
              <div className="flex h-6 rounded-md overflow-hidden shrink-0">
                {["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899"].map(c => (
                  <div key={c} className="w-2 h-full" style={{ backgroundColor: c }} />
                ))}
              </div>
              <div>
                <h1 className="text-sm font-bold text-foreground tracking-tight">Tailwind Colors</h1>
                <p className="text-[11px] text-muted-foreground hidden sm:block">v4 Full Palette &middot; {tailwindColors.length} colors &middot; {tailwindColors.length * 11} shades</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search — desktop only, mobile uses the row below */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索颜色..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-52 rounded-lg border border-border bg-secondary pl-8 pr-8 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Format Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setFormatDropdownOpen(!formatDropdownOpen)}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                >
                  <Copy className="h-3 w-3 text-muted-foreground hidden sm:block" />
                  <span className="text-primary">
                    <span className="sm:hidden">{FORMAT_OPTIONS.find((f) => f.value === copyFormat)?.shortLabel}</span>
                    <span className="hidden sm:inline">{FORMAT_OPTIONS.find((f) => f.value === copyFormat)?.label}</span>
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
                {formatDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-border bg-card shadow-xl z-50">
                    {FORMAT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setCopyFormat(option.value);
                          setFormatDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          copyFormat === option.value
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-accent"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 transition-colors ${
                    viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                  title="网格视图"
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 transition-colors ${
                    viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                  title="列表视图"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Favorites Button */}
              <button
                onClick={() => setFavoritesOpen(!favoritesOpen)}
                className="relative flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
              >
                <Heart className={`h-3.5 w-3.5 ${favorites.size > 0 ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                {favorites.size > 0 && (
                  <span className="flex items-center justify-center h-4 min-w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1">
                    {favorites.size}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Row */}
          <div className="pb-2.5 sm:hidden">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索颜色..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary pl-8 pr-8 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Shade Labels */}
      <div className="sticky top-[88px] sm:top-16 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4 py-2">
            <div className="w-14 sm:w-20 shrink-0" />
            <div className="flex-1 grid grid-cols-11 gap-1 sm:gap-1.5 lg:gap-2">
              {shadeLabels.map((shade) => (
                <div key={shade} className="text-center">
                  <span className="text-[9px] sm:text-[11px] font-medium text-muted-foreground">{shade}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
        {/* Shade Tips */}
        <div className="mb-6">
          <ShadeTips />
        </div>
        {viewMode === "grid" ? (
          <div className="flex flex-col gap-6">
            {colorGroups.map((group) => (
              <section key={group.label}>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">{group.label}</h2>
                <div className="flex flex-col gap-1.5">
                  {group.colors.map((colorGroup) => (
                    <ColorRow
                      key={typeof colorGroup === "string" ? colorGroup : colorGroup.name}
                      group={typeof colorGroup === "string" ? tailwindColors.find((c) => c.name === colorGroup)! : colorGroup}
                      favorites={favorites}
                      onToggleFavorite={handleToggleFavorite}
                      onCopy={handleCopy}
                      copyFormat={copyFormat}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {colorGroups.map((group) => (
              <section key={group.label}>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">{group.label}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {(Array.isArray(group.colors) ? group.colors : []).map((colorGroup) => {
                    const cg = typeof colorGroup === "string" ? tailwindColors.find((c) => c.name === colorGroup)! : colorGroup;
                    return (
                      <div key={cg.name} className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground capitalize">{cg.name}</h3>
                          {cg.isNew && (
                            <span className="inline-flex items-center rounded px-1 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 leading-none">
                              v4.2
                            </span>
                          )}
                        </div>
                        <div className="p-2 flex flex-col gap-0.5">
                          {cg.shades.map((shade) => {
                            const key = `${cg.name}-${shade.shade}`;
                            return (
                              <button
                                key={shade.shade}
                                onClick={() => handleCopy(
                                  copyFormat === "hex" ? shade.hex : copyFormat === "oklch" ? shade.oklch : copyFormat === "tailwind" ? shade.tailwindClass : `var(--color-${cg.name}-${shade.shade})`,
                                  `${copyFormat === "hex" ? "HEX" : copyFormat === "oklch" ? "OKLCH" : copyFormat === "tailwind" ? "Class" : "CSS"} ${copyFormat === "hex" ? shade.hex : copyFormat === "oklch" ? shade.oklch : copyFormat === "tailwind" ? shade.tailwindClass : `var(--color-${cg.name}-${shade.shade})`}`
                                )}
                                onDoubleClick={() => {
                                  setDetailShade(shade);
                                  setDetailColorName(cg.name);
                                }}
                                className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent transition-colors group cursor-pointer"
                              >
                                <div
                                  className="h-7 w-7 rounded-md shrink-0 border border-border/30"
                                  style={{ backgroundColor: shade.hex }}
                                />
                                <span className="text-xs font-medium text-foreground w-8">{shade.shade}</span>
                                <span className="text-xs font-mono text-muted-foreground flex-1 uppercase">{shade.hex}</span>
                                <Heart
                                  className={`h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                                    favorites.has(key) ? "fill-primary text-primary opacity-100" : "text-muted-foreground"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleFavorite(key);
                                  }}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {filteredColors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
            <Palette className="h-12 w-12" />
            <p className="text-lg font-medium">未找到匹配的颜色</p>
            <p className="text-sm">试试搜索 "blue"、"#ef4444" 或 "green"</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-8">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground text-center">
            Tailwind CSS v4.2 Full Palette ({tailwindColors.length} colors / {tailwindColors.length * 11} shades) &middot; 点击色块复制 &middot; 双击列表模式色块查看详情 &middot; HEX / OKLCH / Tailwind Class / CSS Variable
          </p>
        </div>
      </footer>

      {/* Panels & Toasts */}
      <ColorDetailPanel
        shade={detailShade}
        colorName={detailColorName}
        onClose={() => { setDetailShade(null); setDetailColorName(null); }}
        onCopy={handleCopy}
      />

      <FavoritesPanel
        favorites={favorites}
        onRemove={(key) => handleToggleFavorite(key)}
        onClear={() => setFavorites(new Set())}
        onCopy={handleCopy}
        onClose={() => setFavoritesOpen(false)}
        open={favoritesOpen}
      />

      <CopyToast message={toast.message} visible={toast.visible} />
    </div>
  );
}
