"use client";

import React, { useEffect, useMemo, useState } from "react";
import { themeColors } from "@/styles/theme";
import type { PublicationInfo } from "@/lib/types";

type FiltersSectionProps = {
  initialPublications: PublicationInfo[];
  onResults: (publications: PublicationInfo[]) => void;
  className?: string;
};

// 专用的、解耦的过滤器部分，便于未来扩展
export default function FiltersSection({
  initialPublications,
  onResults,
  className = "",
}: FiltersSectionProps) {
  const [selectedCcf, setSelectedCcf] = useState<Set<"A" | "B" | "C">>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ccfParam = useMemo(
    () => Array.from(selectedCcf).join(","),
    [selectedCcf]
  );

  const toggleCcf = (rank: "A" | "B" | "C") => {
    setSelectedCcf((prev) => {
      const next = new Set(prev);
      if (next.has(rank)) next.delete(rank);
      else next.add(rank);
      return next;
    });
  };

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (ccfParam) params.set("ccf", ccfParam);
        // 根据用户体验反馈移除作者参数
        const url = params.toString()
          ? `/api/publications/filter?${params.toString()}`
          : "/api/publications/filter";
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data = Array.isArray(json.data)
          ? (json.data as PublicationInfo[])
          : initialPublications;
        onResults(data);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.error("Filter fetch error:", e);
          setError(e.message || "Unknown error");
          // 回退到初始列表
          onResults(initialPublications);
        }
      } finally {
        setIsLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [ccfParam, onResults, initialPublications]);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
        {/* CCF 过滤按钮 — 激活时匹配出版物标签颜色 */}
        <div className="flex items-center gap-2">
          {["A", "B", "C"].map((r) => {
            const rank = r as "A" | "B" | "C";
            const active = selectedCcf.has(rank);
            const base =
              "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors";
            const inactive = `${themeColors.devBorder ?? "border-gray-300"} ${themeColors.textColorSecondary ?? "text-gray-700"} ${themeColors.backgroundWhite ?? "bg-white"}`;
            // 激活样式镜像 PublicationItem CCF 标签
            const activeClass =
              rank === "A"
                ? `${themeColors.ccfAText ?? "text-blue-900"} ${themeColors.ccfABg ?? "bg-blue-200"} border border-blue-300`
                : rank === "B"
                  ? `${themeColors.ccfBText ?? "text-blue-700"} ${themeColors.ccfBBg ?? "bg-blue-100"} border border-blue-200`
                  : `${themeColors.ccfCText ?? "text-blue-600"} ${themeColors.ccfCBg ?? "bg-blue-50"} border border-blue-100`;
            return (
              <button
                key={rank}
                type="button"
                onClick={() => toggleCcf(rank)}
                className={`${base} ${active ? activeClass : inactive}`}
                title={`Filter CCF ${rank}`}
              >
                CCF {rank}
              </button>
            );
          })}
        </div>
      </div>
      <div
        className={`mt-2 text-xs ${themeColors.textColorTertiary ?? "text-gray-500"}`}
      >
        {isLoading ? "Loading..." : error ? `Error: ${error}` : ""}
      </div>
    </div>
  );
}
