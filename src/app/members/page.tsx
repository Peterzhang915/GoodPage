"use client"; // 转换为客户端组件

import React, { useState, useEffect } from 'react'; // 显式导入 React
// 移除直接导入数据库函数，改为从 API 获取
// import { getAllMembers, Member, calculateMemberGradeStatus } from '@/lib/db'; 
import { MemberCard } from '@/components/MemberCard';
import { themeColors } from '@/styles/theme';

// 定义成员类型，包含显示状态 (需要与 API 返回的类型一致)
interface Member {
  id: string;
  name_en: string | null;
  name_zh: string;
  title_zh: string | null;
  title_en: string | null;
  status: string;
  enrollment_year: number;
  bio_zh: string | null;
  bio_en: string | null;
  avatar_url: string | null;
  email: string | null;
  research_interests: string | null;
  favorite_emojis: string | null; // 确保与 Member 类型一致
  github_url: string | null;  // Added to match expected type
  blog_url: string | null;     // Added to match expected type
  linkedin_url: string | null; // Added to match expected type
}
interface MemberWithDisplayStatus extends Member {
  displayStatus: string;
}

// 定义分组的顺序和标题
const statusOrder: Record<string, number> = {
  '教师': 1,
  '博士后': 2,
  '博士生': 3,
  '硕士生': 4,
  '本科生': 5,
  '访问学者': 6,
  '校友': 7,
};

// 恢复美化后的英文标题
const statusTitles: Record<string, string> = {
  '教师': 'Teachers', 
  '博士后': 'Postdoctoral Researchers',
  '博士生': 'PhD Students',
  '硕士生': 'Master Students',
  '本科生': 'Undergraduate Students',
  '访问学者': 'Visiting Scholars',
  '校友': 'Alumni',
  '其他': 'Other Members',
};

export default function MembersPage() {
  const [members, setMembers] = useState<MemberWithDisplayStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmojiEnabled, setIsEmojiEnabled] = useState(false);

  useEffect(() => {
    async function loadMembersFromApi() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/members');
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (parseError) {
            throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
          }
          throw new Error(errorData.message || `API request failed with status ${response.status}`);
        }
        const data: MemberWithDisplayStatus[] = await response.json();
        setMembers(data);
      } catch (err) {
        console.error("Failed to load members from API:", err);
        setError(err instanceof Error ? err.message : '加载成员信息失败');
      } finally {
        setIsLoading(false);
      }
    }
    loadMembersFromApi();
  }, []);

  // 恢复美化后的分组渲染方式
  const renderGroupedSections = () => {
    const grouped: Record<string, MemberWithDisplayStatus[]> = {};
    members.forEach(member => {
      const groupKey = member.status || '其他';
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(member);
    });

    const sortedGroupKeys = Object.keys(grouped).sort((a, b) => {
      const orderA = statusOrder[a] || 99;
      const orderB = statusOrder[b] || 99;
      return orderA - orderB;
    });

    return sortedGroupKeys.map(groupKey => (
      <section key={groupKey} className="mb-16"> 
        <h2 className={`text-2xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-3 mb-8 flex items-center gap-3`}>
          {groupKey === '教师' && <span className="text-2xl">👨‍🏫</span>}
          {groupKey === '博士后' && <span className="text-2xl">🧑‍🔬</span>}
          {groupKey === '博士生' && <span className="text-2xl">🎓</span>}
          {groupKey === '硕士生' && <span className="text-2xl">🧑‍🎓</span>}
          {groupKey === '本科生' && <span className="text-2xl">🎒</span>}
          {groupKey === '访问学者' && <span className="text-2xl">🤝</span>}
          {groupKey === '校友' && <span className="text-2xl">🌟</span>}
          {statusTitles[groupKey] || 'Other Members'} 
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8"> 
          {grouped[groupKey].map((member) => (
            <MemberCard key={member.id} member={member} isEmojiEnabled={isEmojiEnabled} />
          ))}
        </div>
      </section>
    ));
  };


  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className={`text-4xl font-bold text-center ${themeColors.textColorPrimary} mb-16`}>Meet the Team</h1>

      {isLoading ? (
        <p className={`text-center ${themeColors.textColorTertiary} text-lg`}>Loading members...</p>
      ) : error ? (
        <p className={`text-center ${themeColors.accentColor} ${themeColors.footerBackground} p-4 rounded-lg`}>Error: {error}</p>
      ) : members.length > 0 ? (
         renderGroupedSections()
      ) : (
        <p className={`text-center ${themeColors.textColorTertiary} text-lg`}>No members found.</p>
      )}

      {/* 恢复隐藏在底部的 Emoji 开关按钮 */}
      {!isLoading && !error && members.length > 0 && (
        <div className="mt-24 text-center"> 
          <button 
            onClick={() => setIsEmojiEnabled(!isEmojiEnabled)}
            title={isEmojiEnabled ? 'Disable Fun Emojis' : 'Enable Fun Emojis'}
            className={`p-2 rounded-full transition-all duration-300 ${isEmojiEnabled ? `${themeColors.footerBackground} hover:${themeColors.accentColor}` : `${themeColors.footerBackground} hover:${themeColors.textColorSecondary}`}`}
          >
            <span className="text-xl">{isEmojiEnabled ? '🎉' : '✨'}</span>
          </button>
        </div>
      )}
    </div>
  );
} 