"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  FileText as FileIcon,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { themeColors } from "@/styles/theme";
import type { PublicationInfo } from "@/lib/types";

// --- Props 类型定义 ---
type PublicationsSectionProps = {
  publications: PublicationInfo[] | null | undefined;
};

// 【恢复】定义需要高亮的论文标题集合 (小写)
const highlightedPaperTitles = new Set([
  "deep learning-based weather prediction: a survey",
  "exploring power-performance tradeoffs in database systems",
  "power attack: an increasing threat to data centers.",
  "blending on-demand and spot instances to lower costs for in-memory storage",
  "cadre: carbon-aware data replication for geo-diverse services",
  "pet: reducing database energy cost via query optimization",
  "{user-guided} device driver synthesis", // 注意特殊字符
  "when fpga meets cloud: a first look at performance",
]);

const INITIAL_VISIBLE_COUNT = 5; // Define how many items to show initially

// --- 单个论文条目组件 (保持不变) ---
function MemberPublicationItem({ pub }: { pub: PublicationInfo }) {
  const pdfHref = pub.pdf_url
    ? pub.pdf_url.startsWith("http")
      ? pub.pdf_url
      : `/pdfs/${pub.pdf_url}`
    : undefined;
  const itemKey = pub.id ?? pub.title;
  const isHighlighted =
    pub.title && highlightedPaperTitles.has(pub.title.toLowerCase());

  return (
    <>
      <h4
        className={`text-md font-semibold ${themeColors.textColorPrimary} mb-1`}
      >
        {pub.title}
      </h4>
      {pub.displayAuthors && pub.displayAuthors.length > 0 && (
        <div
          className={`text-xs ${themeColors.textColorSecondary} mb-1 flex flex-wrap items-center gap-x-1.5 gap-y-1`}
        >
          <Users
            className={`w-3 h-3 mr-0.5 ${themeColors.textColorTertiary} flex-shrink-0`}
          />
          {pub.displayAuthors.map((author, index) => (
            <span
              key={`${itemKey}-author-${author.order}`}
              className="inline-block"
            >
              {author.type === "internal" ? (
                <Link
                  href={`/members/${author.id}`}
                  className={`${themeColors.linkColor} hover:underline font-semibold`}
                >
                  {author.name_en || author.name_zh}
                  {author.is_corresponding && (
                    <span
                      title="Corresponding Author"
                      className="text-red-500 ml-0.5"
                    >
                      *
                    </span>
                  )}
                </Link>
              ) : (
                <span className={themeColors.textColorSecondary}>
                  {author.text}
                </span>
              )}
              {index < pub.displayAuthors.length - 1 ? (
                <span className="opacity-80">, </span>
              ) : (
                ""
              )}
            </span>
          ))}
        </div>
      )}
      {/* Venue Line */}
      {pub.venue && (
        <div
          className={`text-xs ${themeColors.textColorTertiary} flex items-center mb-1`}
        >
          {" "}
          {/* Add margin-bottom */}
          <i>{pub.venue}</i>
        </div>
      )}
      {/* Tags Line */}
      <div
        className={`text-xs ${themeColors.textColorTertiary} flex flex-wrap items-center gap-x-2 gap-y-1`}
      >
        {pub.year && (
          <span className="flex items-center">
            <Calendar className={`w-4 h-4 mr-1 flex-shrink-0`} /> {pub.year}
          </span>
        )}
        {isHighlighted && (
          <span
            className={`px-2 py-0.5 rounded-md text-xs font-medium tracking-wide ${themeColors.highlightText ?? "text-amber-900"} ${themeColors.highlightBg ?? "bg-amber-100"} border border-amber-200`}
          >
            🔥 Highly Cited
          </span>
        )}
        {pub.ccf_rank && pub.ccf_rank !== "N/A" && (
          <span
            className={`px-2 py-0.5 rounded-md text-xs font-medium tracking-wide ${
              pub.ccf_rank === "A"
                ? `${themeColors.ccfAText ?? "text-blue-900"} ${themeColors.ccfABg ?? "bg-blue-200"} border border-blue-300`
                : pub.ccf_rank === "B"
                  ? `${themeColors.ccfBText ?? "text-blue-700"} ${themeColors.ccfBBg ?? "bg-blue-100"} border border-blue-200`
                  : pub.ccf_rank === "C"
                    ? `${themeColors.ccfCText ?? "text-blue-600"} ${themeColors.ccfCBg ?? "bg-blue-50"} border border-blue-100`
                    : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}
          >
            CCF {pub.ccf_rank}
          </span>
        )}
        {pub.type && !["CONFERENCE", "JOURNAL"].includes(pub.type) && (
          <span
            className={`px-1.5 py-0.5 rounded text-xs font-medium ${themeColors.ccfCBg ?? "bg-gray-100"} ${themeColors.ccfCText ?? "text-gray-600"} border ${themeColors.footerBorder ?? "border-gray-200"}`}
          >
            {pub.type.charAt(0) + pub.type.slice(1).toLowerCase()}
          </span>
        )}
      </div>
      {pub.abstract && (
        <details className="mt-2 group">
          <summary
            className={`cursor-pointer text-xs ${themeColors.linkColor} hover:underline font-medium list-none group-open:mb-1`}
          >
            Abstract
          </summary>
          <p
            className={`italic text-xs ${themeColors.textColorTertiary} border-l-2 ${themeColors.footerBorder} pl-2 leading-relaxed`}
          >
            {pub.abstract}
          </p>
        </details>
      )}
      {/* 注释掉 keywords 部分，避免类型错误 */}
      {/* {pub.keywords && (
        <div className={`mt-1 text-xs ${themeColors.textColorTertiary}`}>
          <span className="font-semibold mr-1">Keywords:</span> {pub.keywords}
        </div>
      )} */}
      {(pdfHref ||
        pub.slides_url ||
        pub.video_url ||
        pub.code_repository_url ||
        pub.project_page_url) /*|| pub.dblp_url*/ && (
        <div className="flex flex-wrap items-center space-x-3 text-xs mt-1">
          {pdfHref && pdfHref !== "#" && (
            <a
              href={pdfHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${themeColors.primary} hover:underline flex items-center gap-0.5`}
            >
              <FileIcon size={12} />
              PDF
            </a>
          )}
          {/* 注释掉 dblp_url 部分，避免类型错误 */}
          {/* {pub.dblp_url && (
            <a
              href={pub.dblp_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${themeColors.linkColor} hover:underline flex items-center gap-0.5`}
            >
              <LinkIcon size={12} />
              DBLP
            </a>
          )} */}
          {pub.slides_url && (
            <a
              href={pub.slides_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${themeColors.linkColor} hover:underline`}
            >
              Slides
            </a>
          )}
          {pub.video_url && (
            <a
              href={pub.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${themeColors.linkColor} hover:underline`}
            >
              Video
            </a>
          )}
          {pub.code_repository_url && (
            <a
              href={pub.code_repository_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${themeColors.linkColor} hover:underline`}
            >
              Code
            </a>
          )}
          {pub.project_page_url && (
            <a
              href={pub.project_page_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${themeColors.linkColor} hover:underline`}
            >
              Project
            </a>
          )}
        </div>
      )}
    </>
  );
}

// --- 主 Section 组件 ---
const PublicationsSection: React.FC<PublicationsSectionProps> = ({
  publications,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!publications || publications.length === 0) {
    return null;
  }

  const getRankScore = (rank: string | null | undefined): number => {
    if (!rank || rank === "N/A") return 4;
    if (rank === "A") return 1;
    if (rank === "B") return 2;
    if (rank === "C") return 3;
    return 4;
  };

  const sortedPublications = [...publications].sort((a, b) => {
    const rankScoreA = getRankScore(a.ccf_rank);
    const rankScoreB = getRankScore(b.ccf_rank);
    if (rankScoreA !== rankScoreB) {
      return rankScoreA - rankScoreB;
    }
    return 0;
  });

  const displayPublications = isExpanded
    ? sortedPublications
    : sortedPublications.slice(0, INITIAL_VISIBLE_COUNT);

  const totalPublications = sortedPublications.length;
  const remainingCount = totalPublications - INITIAL_VISIBLE_COUNT;

  // Animation variants for list items
  const itemVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      marginBottom: 0,
      paddingBottom: 0,
      borderBottomWidth: 0,
    },
    visible: {
      opacity: 1,
      height: "auto", // Let content determine height
      marginBottom: "1rem", // Corresponds to mb-4
      paddingBottom: "1rem", // Corresponds to pb-4
      borderBottomWidth: "1px", // Corresponds to border-b
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      height: 0,
      marginBottom: 0,
      paddingBottom: 0,
      borderBottomWidth: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <section>
      <h2
        className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}
      >
        <BookOpen size={18} /> Published Works
      </h2>
      <ul className="list-none p-0 mt-2 space-y-0">
        <AnimatePresence initial={false}>
          {displayPublications.map((pub, index) => (
            <motion.li
              key={pub.id ?? pub.title}
              className={`border-b ${themeColors.footerBorder} overflow-hidden`}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              style={{
                borderBottomWidth:
                  index === displayPublications.length - 1 ? 0 : "1px",
              }}
            >
              <MemberPublicationItem pub={pub} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {totalPublications > INITIAL_VISIBLE_COUNT && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`text-sm ${themeColors.linkColor} hover:underline focus:outline-none flex items-center justify-center mx-auto gap-1`}
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} /> Show Less
              </>
            ) : (
              <>
                <ChevronDown size={16} /> Show More ({remainingCount} more)
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
};

export default PublicationsSection;
