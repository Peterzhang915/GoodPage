import { useState, useMemo } from "react";
import { PublicationWithAuthors } from "@/app/api/publications/route";

/**
 * 搜索功能Hook
 * 负责处理出版物的搜索和过滤逻辑
 */
export const useSearch = (publications: PublicationWithAuthors[]) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  // 过滤后的出版物列表
  const filteredPublications = useMemo(() => {
    if (!searchTerm.trim()) {
      return publications;
    }

    // 支持多关键词搜索（用空格分隔）
    const searchTerms = searchTerm.toLowerCase().split(/\s+/).filter(term => term.length > 0);

    return publications.filter(pub => {
      // 对于每个搜索词，检查是否在任何字段中匹配
      return searchTerms.every(term => {
        // 标题匹配
        const titleMatch = pub.title?.toLowerCase().includes(term) || false;

        // 场所匹配
        const venueMatch = pub.venue?.toLowerCase().includes(term) || false;

        // 作者匹配（支持结构化作者数据）
        const authorMatch = pub.authors?.some(author =>
          author.author?.name_en?.toLowerCase().includes(term) ||
          author.author?.name_zh?.toLowerCase().includes(term)
        ) || false;

        // 作者字符串匹配（支持原始作者字符串，适用于 pending 数据）
        const authorStringMatch = pub.authors_full_string?.toLowerCase().includes(term) || false;

        // 年份匹配
        const yearMatch = pub.year?.toString().includes(term) || false;

        // 类型匹配
        const typeMatch = pub.type?.toLowerCase().includes(term) || false;

        // 摘要匹配
        const abstractMatch = pub.abstract?.toLowerCase().includes(term) || false;

        // 关键词匹配
        const keywordsMatch = pub.keywords?.toLowerCase().includes(term) || false;

        // 出版商匹配
        const publisherMatch = pub.publisher?.toLowerCase().includes(term) || false;

        // CCF 等级匹配
        const ccfMatch = pub.ccf_rank?.toLowerCase().includes(term) || false;

        // 卷号、期号、页码匹配
        const volumeMatch = pub.volume?.toLowerCase().includes(term) || false;
        const numberMatch = pub.number?.toLowerCase().includes(term) || false;
        const pagesMatch = pub.pages?.toLowerCase().includes(term) || false;

        // 至少一个字段匹配该搜索词
        return titleMatch || venueMatch || authorMatch || authorStringMatch ||
               yearMatch || typeMatch || abstractMatch || keywordsMatch ||
               publisherMatch || ccfMatch || volumeMatch || numberMatch || pagesMatch;
      });
    });
  }, [publications, searchTerm]);

  // 清除搜索
  const clearSearch = () => {
    setSearchTerm("");
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredPublications,
    clearSearch,
    hasSearch: searchTerm.trim().length > 0,
    resultCount: filteredPublications.length,
  };
};
