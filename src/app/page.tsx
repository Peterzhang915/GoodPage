import React from "react";
import HeroSection from "@/components/home/HeroSection";
import ContentSection from "@/components/common/ContentSection";
import { themeColors } from "@/styles/theme";
import { AlertTriangle, Loader } from "lucide-react"; // 引入图标用于状态反馈
import StudentInterestsSection from "@/components/home/StudentInterestsSection";
import MainProjectsSection from "@/components/home/MainProjectsSection";
import FormerProjectsSection from "@/components/home/FormerProjectsSection";
import TeachingSection from "@/components/home/TeachingSection";

// --- 数据类型定义 ---
// (与数据库模型对应，只包含前端需要的字段)
interface HomepageNewsItem {
  id: number;
  content: string;
  is_visible: boolean;
}

interface InterestPointItem {
  id: number;
  title: string;
  description: string;
  is_visible: boolean;
}

enum ProjectType { MAIN = 'MAIN', FORMER = 'FORMER' }

interface HomepageProjectItem {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  project_url: string | null; // Renamed from link_url in editor to match schema?
  type: ProjectType;
  is_visible: boolean;
}

interface HomepageTeachingItem {
  id: number;
  course_title: string;
  details: string | null;
  is_visible: boolean;
}

// --- 通用数据获取函数 ---
async function fetchSectionData<T>(
  endpoint: string,
): Promise<{ data: T[] | null; error: string | null }> {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}${endpoint}`;
  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    if (!res.ok) {
      let errorMessage = `Server error (${res.status})`;
      try {
        const errorPayload = await res.json();
        if (
          errorPayload &&
          errorPayload.success === false &&
          errorPayload.error &&
          errorPayload.error.message
        ) {
          errorMessage = errorPayload.error.message;
        }
      } catch (parseErr) {
         errorMessage = res.statusText || errorMessage;
      }
      console.error(`Failed to fetch ${endpoint}: ${errorMessage}`);
      return { data: null, error: `Failed to load data: ${errorMessage}` };
    }
    const payload = await res.json();
    if (payload.success && Array.isArray(payload.data)) {
      // 过滤掉 is_visible 为 false 的项 (在服务器端做更佳)
       const visibleData = payload.data.filter((item: any) => item.is_visible !== false);
      return { data: visibleData as T[], error: null };
    } else {
      const errorMessage = payload?.error?.message || "Invalid data format from server.";
      console.error(`Invalid data format from ${endpoint}:`, payload);
      return { data: null, error: `Failed to load data: ${errorMessage}` };
    }
  } catch (error: any) {
    console.error(`Error fetching ${endpoint}:`, error.message);
    return {
      data: null,
      error: `Network or request error (${error.message || "Unknown error"}).`,
    };
  }
}

// 主页组件定义为 async 函数
export default async function Home() {
  // 并行获取所有板块数据
  const [
    newsResult,
    interestsResult,
    mainProjectsResult,
    formerProjectsResult,
    teachingResult,
  ] = await Promise.all([
    fetchSectionData<HomepageNewsItem>("/api/homepage/news"),
    fetchSectionData<InterestPointItem>("/api/homepage/interest-points"),
    fetchSectionData<HomepageProjectItem>("/api/homepage/projects?type=MAIN"), // Fetch only MAIN projects
    fetchSectionData<HomepageProjectItem>("/api/homepage/projects?type=FORMER"),// Fetch only FORMER projects
    fetchSectionData<HomepageTeachingItem>("/api/homepage/teaching"),
  ]);

  // 提取数据和错误信息
  const newsItems = newsResult.data;
  const newsError = newsResult.error;
  const interestPoints = interestsResult.data;
  const interestsError = interestsResult.error;
  const mainProjects = mainProjectsResult.data;
  const mainProjectsError = mainProjectsResult.error;
  const formerProjects = formerProjectsResult.data;
  const formerProjectsError = formerProjectsResult.error;
  const teachingItems = teachingResult.data;
  const teachingError = teachingResult.error;

  // 招聘信息 (可以考虑也做成可编辑)
  const recruitmentText =
    "We always look for self-motivated under/graduate students who are ready to take on ambitious challenges to join my research group (with financial support).";

  return (
    // 使用 main 标签包裹页面主要内容，flex 布局使其内容垂直排列
    <main className="flex flex-col items-center">
      {/* 页面顶部的英雄区域组件 */}
      <HeroSection />
      {/* 主要内容区域容器: 设置更宽的最大宽度(max-w-7xl)，响应式内外边距，基础文字颜色 */}
      <div
        className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 ${themeColors.textColorPrimary}`}
      >
        {/* 使用 flex 布局并设置较大的垂直间距分隔各个内容板块 */}
        <div className="flex flex-col space-y-16 md:space-y-20">
          {/* 新闻 (News) 板块 */}
          <ContentSection
            id="news"
            title="News" // 板块标题
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* 招聘信息段落: 使用 JSX 并添加 strong 标签 */}
            <p
              className={`mb-6 text-base leading-relaxed ${themeColors.textColorSecondary}`}
            >
              We always look for <strong>self-motivated</strong> under/graduate
              students who are ready to take on ambitious challenges to join my
              research group (with <strong>financial support</strong>).
            </p>

            {/* 分隔线 */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

            {/* 新闻内容的条件渲染区域 (保持不变) */}
            {newsError ? (
              <div
                className={`flex items-center space-x-2 text-red-600 dark:text-red-400`}
              >
                <AlertTriangle className="h-5 w-5" />
                <span>{newsError}</span>
              </div>
            ) : newsItems && newsItems.length > 0 ? (
              <div>
                {/* 新闻列表: 调整响应式内边距和字体大小 */}
                <ul
                  className={`list-disc pl-5 sm:pl-6 space-y-3 text-sm md:text-base ${themeColors.textColorSecondary}`}
                >
                  {" "}
                  {/* 修改: pl-6 -> pl-5 sm:pl-6 */}
                  {newsItems.map((item) => (
                    <li key={item.id} className="break-words">
                      {item.content}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p
                className={`${themeColors.textColorSecondary} text-sm md:text-base`}
              >
                No recent news available.
              </p> // 确保空状态文字大小也响应式
            )}
          </ContentSection>

          {/* 学生兴趣板块 (提取到独立组件) */}
          <StudentInterestsSection items={interestPoints} error={interestsError} />

          {/* 主要研究项目板块 (提取到独立组件) */}
          <MainProjectsSection items={mainProjects} error={mainProjectsError} />

          {/* 过往项目板块 (提取到独立组件) */}
          <FormerProjectsSection items={formerProjects} error={formerProjectsError} />

          {/* 教学板块 (提取到独立组件) */}
          <TeachingSection items={teachingItems} error={teachingError} />

          {/* 用于导航的占位符区域: 添加响应式 scroll-margin-top */}
          <section
            id="professor"
            className="scroll-mt-16 md:scroll-mt-20"
          ></section>
          <section
            id="members"
            className="scroll-mt-16 md:scroll-mt-20"
          ></section>
          <section
            id="contact"
            className="scroll-mt-16 md:scroll-mt-20"
          ></section>
          <section id="blog" className="scroll-mt-16 md:scroll-mt-20"></section>
        </div>{" "}
        {/* 主要内容 flex 容器结束 */}
      </div>{" "}
      {/* 内容包装器 div 结束 */}
    </main>
  );
}
