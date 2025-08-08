"use client";

import React, { useMemo, useState } from "react";
import { themeColors } from "@/styles/theme";
import type { PublicationInfo } from "@/lib/types";
import PublicationItem from "@/components/publications/PublicationItem";
import FiltersSection from "@/components/publications/FiltersSection";

type PublicationsBrowserProps = {
  publications: PublicationInfo[];
  className?: string;
};

// 预设作者/姓名关键词以便快速过滤
const presetKeywords: string[] = [
  "Zichen Xu",
  "Jiahui Hu",
];

export default function PublicationsBrowser({ publications, className = "" }: PublicationsBrowserProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  // 来自解耦的 FiltersSection 的结果（服务器支持）
  const [serverFiltered, setServerFiltered] = useState<PublicationInfo[]>(publications);

  const handlePresetClick = (keyword: string) => {
    // 切换行为：如果关键词已存在，则移除；否则追加
    const parts = searchTerm.split(/\s+/).filter(Boolean);
    const exists = parts.some((p) => p.toLowerCase() === keyword.toLowerCase());
    const updated = exists
      ? parts.filter((p) => p.toLowerCase() !== keyword.toLowerCase()).join(" ")
      : (parts.concat(keyword)).join(" ");
    setSearchTerm(updated.trim());
  };

  // 注意：CCF 过滤已移至 FiltersSection（服务器支持）。客户端搜索保留在此处。

  const filteredPublications: PublicationInfo[] = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return serverFiltered;

    const tokens = term.split(/\s+/).filter(Boolean);

    // 在服务器过滤结果的基础上应用客户端文本搜索
    return serverFiltered.filter((pub) => {
      return tokens.every((t) => {
        const titleMatch = pub.title?.toLowerCase().includes(t) ?? false;
        const venueMatch = pub.venue?.toLowerCase().includes(t) ?? false;
        const yearMatch = pub.year?.toString().includes(t) ?? false;
        const ccfMatch = pub.ccf_rank?.toLowerCase().includes(t) ?? false;
        const typeMatch = pub.type?.toLowerCase().includes(t) ?? false;
        const abstractMatch = pub.abstract?.toLowerCase().includes(t) ?? false;
        const keywordsMatch = pub.keywords?.toLowerCase().includes(t) ?? false;
        const publisherMatch = pub.publisher?.toLowerCase().includes(t) ?? false;
        const authorMatch = (pub.displayAuthors || []).some((a) => {
          if (a.type === "internal") {
            return (
              a.name_en?.toLowerCase().includes(t) ||
              (a.name_zh ? a.name_zh.toLowerCase().includes(t) : false)
            );
          }
          return a.text?.toLowerCase().includes(t);
        });

        const tokenMatched = (
          titleMatch ||
          venueMatch ||
          authorMatch ||
          yearMatch ||
          ccfMatch ||
          typeMatch ||
          abstractMatch ||
          keywordsMatch ||
          publisherMatch
        );
        return tokenMatched;
      });
    });
  }, [serverFiltered, searchTerm]);

  // 过滤后按年份分组
  const grouped = useMemo(() => {
    const map: Record<string, PublicationInfo[]> = {};
    for (const pub of filteredPublications) {
      const year = String(pub.year ?? "Unknown");
      if (!map[year]) map[year] = [];
      map[year].push(pub);
    }
    const years = Object.keys(map).sort((a, b) => parseInt(b) - parseInt(a));
    return { map, years } as { map: Record<string, PublicationInfo[]>; years: string[] };
  }, [filteredPublications]);

  return (
    <div className={`w-full ${className}`}>
      {/* 搜索控件 */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col gap-3">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search by title, author, venue, year, keywords..."
            className={`w-full px-3 py-2 rounded-md border ${themeColors.borderLight ?? "border-gray-300"} ${themeColors.backgroundWhite ?? "bg-white"} ${themeColors.textColorPrimary ?? "text-gray-900"}`}
          />
          <div className="flex items-center justify-between gap-3">
            {/* 预设关键词（左侧） */}
            <div className="flex flex-nowrap gap-2">
              {presetKeywords.map((kw) => {
                const active = searchTerm.toLowerCase().split(/\s+/).includes(kw.toLowerCase());
                return (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => handlePresetClick(kw)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                      active
                        ? `${themeColors.primaryBg ?? "bg-blue-600"} ${themeColors.textWhite ?? "text-white"} border-transparent`
                        : `${themeColors.devBorder ?? "border-gray-300"} ${themeColors.textColorSecondary ?? "text-gray-700"} ${themeColors.backgroundWhite ?? "bg-white"}`
                    }`}
                  >
                    {kw}
                  </button>
                );
              })}
            </div>
            {/* CCF 过滤标签（右侧） */}
            <FiltersSection initialPublications={publications} onResults={setServerFiltered} />
          </div>
          <div className={`text-xs ${themeColors.textColorTertiary ?? "text-gray-500"}`}>
            Showing {filteredPublications.length} / {serverFiltered.length} publications (filtered from {publications.length} total)
          </div>
        </div>
      </div>

      {/* 按年份分组的结果 */}
      {grouped.years.length > 0 ? (
        grouped.years.map((year) => (
          <section key={year} className="mb-12 md:mb-16">
            <h2
              id={`year-${year}`}
              className={`text-2xl sm:text-3xl font-semibold ${themeColors.textColorPrimary ?? ""} border-b ${themeColors.footerBorder ?? "border-gray-300"} pb-3 mb-8 scroll-mt-20`}
            >
              {year}
            </h2>
            <ul className="list-none p-0">
              {grouped.map[year].map((pub) => (
                <PublicationItem key={pub.id ?? pub.dblp_url ?? pub.title} pub={pub} />
              ))}
            </ul>
          </section>
        ))
      ) : (
        <p className={`${themeColors.textColorTertiary ?? "text-gray-500"} text-lg mt-8`}>
          No matching publications.
        </p>
      )}
    </div>
  );
}


