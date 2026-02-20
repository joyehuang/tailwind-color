"use client";

import { Copy, Heart, Check } from "lucide-react";
import { useState } from "react";
import type { ColorShade } from "@/lib/tailwind-colors";

type CopyFormat = "hex" | "oklch" | "tailwind" | "css-var";

interface ColorSwatchProps {
  shade: ColorShade;
  colorName: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onCopy: (text: string, label: string) => void;
  copyFormat: CopyFormat;
}

function getCopyValue(shade: ColorShade, colorName: string, format: CopyFormat): { text: string; label: string } {
  switch (format) {
    case "hex":
      return { text: shade.hex, label: `HEX ${shade.hex}` };
    case "oklch":
      return { text: shade.oklch, label: `OKLCH ${shade.oklch}` };
    case "tailwind":
      return { text: shade.tailwindClass, label: `Class ${shade.tailwindClass}` };
    case "css-var":
      return { text: `var(--color-${colorName}-${shade.shade})`, label: `CSS var(--color-${colorName}-${shade.shade})` };
  }
}

function getTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#000000" : "#ffffff";
}

export function ColorSwatch({ shade, colorName, isFavorite, onToggleFavorite, onCopy, copyFormat }: ColorSwatchProps) {
  const [justCopied, setJustCopied] = useState(false);
  const textColor = getTextColor(shade.hex);

  const handleCopy = () => {
    const { text, label } = getCopyValue(shade, colorName, copyFormat);
    onCopy(text, label);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1200);
  };

  return (
    <button
      onClick={handleCopy}
      className="group relative flex flex-col rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-black/20 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
    >
      <div
        className="h-16 sm:h-20 w-full relative flex items-center justify-center"
        style={{ backgroundColor: shade.hex }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: textColor }}
        >
          {justCopied ? <Check className="h-5 w-5" /> : <Copy className="h-4 w-4" />}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
          style={{ color: textColor }}
        >
          <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>
      <div className="flex flex-col gap-0.5 px-2 py-1.5 bg-card text-left">
        <span className="text-[11px] font-medium text-foreground">{shade.shade}</span>
        <span className="text-[10px] font-mono text-muted-foreground uppercase">{shade.hex}</span>
      </div>
    </button>
  );
}
