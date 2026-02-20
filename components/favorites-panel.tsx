"use client";

import { Heart, Copy, Trash2, X } from "lucide-react";
import { tailwindColors } from "@/lib/tailwind-colors";

interface FavoritesPanelProps {
  favorites: Set<string>;
  onRemove: (key: string) => void;
  onClear: () => void;
  onCopy: (text: string, label: string) => void;
  onClose: () => void;
  open: boolean;
}

export function FavoritesPanel({ favorites, onRemove, onClear, onCopy, onClose, open }: FavoritesPanelProps) {
  const favoriteItems = Array.from(favorites).map((key) => {
    const [colorName, shadeStr] = key.split("-");
    const shade = Number(shadeStr);
    const colorGroup = tailwindColors.find((c) => c.name === colorName);
    const colorShade = colorGroup?.shades.find((s) => s.shade === shade);
    return { key, colorName, shade, colorShade, colorGroup };
  }).filter((item) => item.colorShade);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-background/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <div
        className={`fixed top-0 right-0 z-40 h-full w-80 border-l border-border bg-card shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary fill-primary" />
            <span className="text-sm font-semibold text-foreground">
              收藏夹 ({favoriteItems.length})
            </span>
          </div>
          <div className="flex items-center gap-1">
            {favoriteItems.length > 0 && (
              <button
                onClick={onClear}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="清空收藏"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100%-53px)] p-3 flex flex-col gap-2">
          {favoriteItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
              <Heart className="h-8 w-8" />
              <p className="text-sm">还没有收藏的颜色</p>
              <p className="text-xs text-center">悬停颜色卡片并点击心形按钮添加收藏</p>
            </div>
          ) : (
            favoriteItems.map(({ key, colorName, colorShade }) => (
              <div
                key={key}
                className="flex items-center gap-3 rounded-lg bg-secondary p-2 group hover:bg-accent transition-colors"
              >
                <div
                  className="h-10 w-10 rounded-md shrink-0 border border-border/50"
                  style={{ backgroundColor: colorShade!.hex }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground capitalize">
                    {colorName}-{colorShade!.shade}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground uppercase">
                    {colorShade!.hex}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onCopy(colorShade!.hex, `HEX ${colorShade!.hex}`)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                    title="复制 HEX"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onRemove(key)}
                    className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
                    title="移除收藏"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
