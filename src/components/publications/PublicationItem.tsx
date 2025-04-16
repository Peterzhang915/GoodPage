"use client"; // Mark as client component if using hooks like useState/useEffect for copyBibtex

import React from "react";
import Link from "next/link";
import Image from "next/image"; // Keep Image import if potentially used for author avatars later
import {
  BookOpen,
  Link as LinkIcon,
  FileText as FileIcon,
  Calendar,
  Users,
  Copy,
} from "lucide-react";
import { themeColors } from "@/styles/theme";
import type { PublicationInfo, DisplayAuthor } from "@/lib/types";
// Ensure Member type is available if AuthorInfo relies on it, or adjust AuthorInfo type if needed
// import type { Member } from '@/lib/prisma';

// 【新增】定义需要高亮的论文标题集合 (小写), 可根据需要调整
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

/**
 * Type definition for the props of the PublicationItem component.
 */
type PublicationItemProps = {
  /** The publication data object containing title, displayAuthors, venue, etc. */
  pub: PublicationInfo;
};

/**
 * PublicationItem Component
 *
 * Renders a single publication entry with its details, including title, authors,
 * venue, year, and links to DBLP and PDF (if available).
 * Internal authors are linked to their member pages.
 */
const PublicationItem: React.FC<PublicationItemProps> = ({ pub }) => {
  const pdfHref = pub.pdf_url
    ? pub.pdf_url.startsWith("http")
      ? pub.pdf_url
      : `/pdfs/${pub.pdf_url}`
    : undefined;

  // Use pub.id or title as a fallback key
  const itemKey = pub.id ?? pub.title;

  // 【新增】检查当前论文是否需要高亮
  const isHighlighted =
    pub.title && highlightedPaperTitles.has(pub.title.toLowerCase());

  // TODO: Implement handleCopyBibtex logic if needed
  // const handleCopyBibtex = async () => { ... };

  return (
    <li
      id={`pub-${pub.id}`}
      className={`mb-6 md:mb-8 p-4 md:p-6 ${themeColors.backgroundWhite ?? "bg-white"} rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border ${themeColors.borderLight ?? "border-gray-200 dark:border-gray-700"} scroll-mt-20`}
    >
      <h3
        className={`text-base md:text-lg font-semibold ${themeColors.textColorPrimary ?? ""} mb-2 leading-tight flex items-start`}
      >
        <BookOpen
          className={`w-5 h-5 mr-2 mt-0.5 ${themeColors.primary ?? "text-blue-600"} flex-shrink-0`}
        />
        <span className="flex-grow">{pub.title}</span>
      </h3>
      {pub.displayAuthors && pub.displayAuthors.length > 0 && (
        <div
          className={`text-sm ${themeColors.textColorSecondary ?? ""} mb-2 pl-7 flex items-center flex-wrap gap-x-1.5 gap-y-1`}
        >
          <Users
            className={`w-4 h-4 mr-1 ${themeColors.textColorTertiary ?? "text-gray-500"} flex-shrink-0`}
          />
          {pub.displayAuthors.map((author, index) => (
            <React.Fragment key={`${itemKey}-author-${author.order}`}>
              {author.type === "internal" ? (
                <Link
                  href={`/members/${author.id}`}
                  className={`${themeColors.linkColor ?? "text-blue-600"} hover:underline transition-colors`}
                >
                  {author.name_zh || author.name_en}
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
                <span>{author.text}</span>
              )}
              {index < pub.displayAuthors.length - 1 ? (
                <span className="ml-0.5 mr-0.5">,</span>
              ) : (
                ""
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      <div
        className={`text-xs sm:text-sm ${themeColors.textColorTertiary ?? "text-gray-500"} mb-3 pl-7 flex flex-wrap items-center gap-x-2 gap-y-1`}
      >
        {" "}
        {/* Adjusted gap */}
        {pub.venue && (
          <span className="flex items-center">
            <i>{pub.venue}</i>
          </span>
        )}
        {pub.year && (
          <span className="flex items-center">
            <Calendar className={`w-4 h-4 mr-1 flex-shrink-0`} /> {pub.year}
          </span>
        )}
        {/* 【新增】高亮标签 */}
        {isHighlighted && (
          <span
            className={`px-2 py-0.5 rounded-md text-xs font-medium tracking-wide ${themeColors.highlightText ?? "text-amber-900"} ${themeColors.highlightBg ?? "bg-amber-100"} border border-amber-200`}
          >
            🔥 Highly Cited
          </span>
        )}
        {/* CCF Rank 标签 */}
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
        {pub.type && pub.type !== "CONFERENCE" && pub.type !== "JOURNAL" && (
          <span
            className={`px-2 py-0.5 rounded-md text-xs font-medium bg-opacity-15 ${themeColors.backgroundDark ?? "bg-gray-500"} ${themeColors.textColorSecondary ?? "text-gray-700"}`}
          >
            {pub.type}
          </span>
        )}
      </div>
      {pub.abstract && (
        <details
          className={`text-sm ${themeColors.textColorSecondary ?? ""} mt-3 group pl-7`}
        >
          <summary
            className={`cursor-pointer ${themeColors.linkColor ?? "text-blue-600"} hover:underline font-medium list-none group-open:mb-2 text-xs sm:text-sm`}
          >
            Show Abstract
          </summary>
          <p
            className={`italic ${themeColors.textColorTertiary ?? "text-gray-600"} border-l-2 ${themeColors.borderLight ?? "border-gray-300"} pl-3 text-xs sm:text-sm leading-relaxed`}
          >
            {pub.abstract}
          </p>
        </details>
      )}
      {pub.keywords && (
        <div
          className={`mt-3 text-xs sm:text-sm ${themeColors.textColorTertiary ?? "text-gray-500"} pl-7`}
        >
          <span className="font-semibold mr-1">Keywords:</span> {pub.keywords}
        </div>
      )}
      {(pub.dblp_url ||
        pdfHref ||
        pub.slides_url ||
        pub.video_url ||
        pub.code_repository_url ||
        pub.project_page_url) && (
        <div className="mt-4 pl-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {pub.dblp_url && (
            <a
              href={pub.dblp_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${themeColors.linkColor ?? "text-blue-600"} hover:underline transition-colors font-medium flex items-center`}
            >
              <LinkIcon className="w-4 h-4 mr-1" /> DBLP
            </a>
          )}
          {pdfHref && pdfHref !== "#" && (
            <a
              href={pdfHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${themeColors.primary ?? "text-red-600"} hover:underline transition-colors font-medium flex items-center`}
            >
              <FileIcon className="w-4 h-4 mr-1" /> PDF
            </a>
          )}
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
    </li>
  );
};

export default PublicationItem;
