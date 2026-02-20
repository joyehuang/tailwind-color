"use client";

import { Copy, X } from "lucide-react";
import type { ColorShade } from "@/lib/tailwind-colors";

interface ColorDetailPanelProps {
  shade: ColorShade | null;
  colorName: string | null;
  onClose: () => void;
  onCopy: (text: string, label: string) => void;
}

function getTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#000000" : "#ffffff";
}

export function ColorDetailPanel({ shade, colorName, onClose, onCopy }: ColorDetailPanelProps) {
  if (!shade || !colorName) return null;

  const textColor = getTextColor(shade.hex);
  const items = [
    { label: "Tailwind Class", value: shade.tailwindClass },
    { label: "HEX", value: shade.hex },
    { label: "OKLCH", value: shade.oklch },
    { label: "CSS Variable", value: `var(--color-${colorName}-${shade.shade})` },
    { label: "Text Class", value: `text-${colorName}-${shade.shade}` },
    { label: "Border Class", value: `border-${colorName}-${shade.shade}` },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md mx-4 rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-32 flex items-center justify-center relative" style={{ backgroundColor: shade.hex }}>
          <span className="text-2xl font-bold font-mono" style={{ color: textColor }}>
            {colorName}-{shade.shade}
          </span>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-md transition-colors hover:opacity-80"
            style={{ color: textColor }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-4 rounded-lg bg-secondary px-3 py-2 group cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onCopy(item.value, `${item.label}: ${item.value}`)}
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[11px] text-muted-foreground">{item.label}</span>
                <span className="text-sm font-mono text-foreground truncate">{item.value}</span>
              </div>
              <Copy className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
