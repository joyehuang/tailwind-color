"use client";

import type { ColorGroup } from "@/lib/tailwind-colors";
import { ColorSwatch } from "./color-swatch";

type CopyFormat = "hex" | "oklch" | "tailwind" | "css-var";

interface ColorRowProps {
  group: ColorGroup;
  favorites: Set<string>;
  onToggleFavorite: (key: string) => void;
  onCopy: (text: string, label: string) => void;
  copyFormat: CopyFormat;
}

export function ColorRow({ group, favorites, onToggleFavorite, onCopy, copyFormat }: ColorRowProps) {
  return (
    <div className="group/row">
      <div className="flex items-start gap-4">
        <div className="w-20 shrink-0 pt-4 sm:pt-5">
          <span className="text-sm font-medium text-foreground capitalize">{group.name}</span>
        </div>
        <div className="flex-1 grid grid-cols-11 gap-1.5 sm:gap-2">
          {group.shades.map((shade) => {
            const key = `${group.name}-${shade.shade}`;
            return (
              <ColorSwatch
                key={key}
                shade={shade}
                colorName={group.name}
                isFavorite={favorites.has(key)}
                onToggleFavorite={() => onToggleFavorite(key)}
                onCopy={onCopy}
                copyFormat={copyFormat}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
