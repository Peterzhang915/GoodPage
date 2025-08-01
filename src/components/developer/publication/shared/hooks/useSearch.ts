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

    const searchLower = searchTerm.toLowerCase();
    
    return publications.filter(pub => {
      // 标题匹配
      const titleMatch = pub.title.toLowerCase().includes(searchLower);
      
      // 场所匹配
      const venueMatch = pub.venue?.toLowerCase().includes(searchLower) || false;
      
      // 作者匹配
      const authorMatch = pub.authors?.some(author => 
        author.author?.name_en?.toLowerCase().includes(searchLower) ||
        author.author?.name_zh?.toLowerCase().includes(searchLower)
      ) || false;
      
      // 年份匹配
      const yearMatch = pub.year?.toString().includes(searchTerm) || false;

      return titleMatch || venueMatch || authorMatch || yearMatch;
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
