"use client";

import { useState } from "react";
import { Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { shadeTips } from "@/lib/tailwind-colors";

const rangeColorMap: Record<string, string[]> = {
  "50 - 100": ["#dbeafe", "#bfdbfe"],
  "200 - 300": ["#93c5fd", "#60a5fa"],
  "400 - 600": ["#3b82f6", "#2563eb"],
  "700 - 950": ["#1e40af", "#1e3a8a"],
};

export function ShadeTips() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-amber-500/15">
            <Lightbulb className="h-4 w-4 text-amber-400" />
          </div>
          <span className="text-sm font-semibold text-foreground">50-950 色阶使用指南</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">-- Tailwind 的科学灰度阶梯体系，非常适合做 Theme</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border">
          <div className="p-5">
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Tailwind CSS 将每个颜色分为 11 个层级（50, 100, 200 ... 900, 950），这种体系极其适合直接映射到组件库和主题的设计系统中。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shadeTips.map((tip) => {
                const colors = rangeColorMap[tip.range] || ["#3b82f6", "#2563eb"];
                return (
                  <div
                    key={tip.range}
                    className="rounded-lg border border-border bg-secondary/50 p-4 flex flex-col gap-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {colors.map((color, i) => (
                          <div
                            key={i}
                            className="h-6 w-6 rounded-md border border-border/30"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div>
                        <span className="text-sm font-bold font-mono text-foreground">{tip.range}</span>
                        <span className="ml-2 text-xs font-medium text-primary">{tip.usage}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
                    <code className="text-[11px] font-mono text-amber-400/80 bg-background/60 rounded px-2 py-1 self-start">
                      {tip.example}
                    </code>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
