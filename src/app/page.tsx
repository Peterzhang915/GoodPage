import React from "react";
import HeroSection from "@/components/home/HeroSection";
import ContentSection from "@/components/common/ContentSection";
import { themeColors } from "@/styles/theme";
import { AlertTriangle, Loader } from "lucide-react"; // 引入图标用于状态反馈
import StudentInterestsSection from "@/components/home/StudentInterestsSection";
import MainProjectsSection from "@/components/home/MainProjectsSection";
import FormerProjectsSection from "@/components/home/FormerProjectsSection";
import TeachingSection from "@/components/home/TeachingSection";

// 新闻 API 响应的接口定义
interface NewsApiResponse {
  title: string;
  news: string[];
}

// 主页组件定义为 async 函数，以便在内部使用 await 来获取数据
export default async function Home() {
  // 初始化新闻数据、错误状态和加载状态
  let newsData: NewsApiResponse | null = null;
  let fetchError: string | null = null;
  let isLoading = true; // 初始假定正在加载

  // --- 数据获取: 尝试从 API 加载最新新闻 ---
  try {
    // 从环境变量或默认值获取 API 地址
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/news`;
    // 发起请求，禁用缓存以获取最新数据
    const res = await fetch(apiUrl, { cache: "no-store" });
    isLoading = false; // 请求完成，设置 loading 为 false
    if (res.ok) {
      // 请求成功 (status 2xx)
      const responsePayload = await res.json();
      // 检查响应是否符合标准成功格式
      if (
        responsePayload &&
        responsePayload.success === true &&
        responsePayload.data
      ) {
        // 验证 data 部分的格式是否符合 NewsApiResponse
        const newsResult = responsePayload.data;
        if (
          newsResult &&
          typeof newsResult.title === "string" &&
          Array.isArray(newsResult.news) &&
          newsResult.news.every((item: unknown) => typeof item === "string")
        ) {
          newsData = newsResult as NewsApiResponse;
        } else {
          // data 部分格式不符合预期
          console.error("从 API 收到的新闻数据 data 部分格式无效:", newsResult);
          fetchError = "Failed to load news: Invalid data format received.";
        }
      } else {
        // 响应格式不符合标准成功格式 (或 success 不为 true)
        console.error("API 响应格式无效或指示失败:", responsePayload);
        const errorMessage =
          responsePayload?.error?.message ||
          "Invalid response format from server.";
        fetchError = `Failed to load news: ${errorMessage}`;
      }
    } else {
      // 请求失败 (status 非 2xx)
      let errorMessage = `Server error (${res.status})`;
      try {
        // 尝试解析错误响应体 (可能包含标准错误结构)
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
        // 解析错误响应体失败，使用原始状态文本
        errorMessage = res.statusText || errorMessage;
      }
      console.error(`获取新闻失败: ${errorMessage}`);
      fetchError = `Failed to load news: ${errorMessage}`; // Use the parsed or default error message
    }
  } catch (error: any) {
    // 请求过程中发生网络或其他错误
    isLoading = false; // 请求完成，设置 loading 为 false
    console.error("获取新闻数据时出错:", error);
    fetchError = `Failed to load news: Network or request error (${error.message || "Unknown error"}).`;
  }

  // 招聘信息文本（通常是静态内容）
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
            {isLoading ? (
              <div
                className={`flex items-center space-x-2 ${themeColors.textColorSecondary}`}
              >
                <Loader className="animate-spin h-5 w-5" />
                <span>Loading news...</span>
              </div>
            ) : fetchError ? (
              <div
                className={`flex items-center space-x-2 text-red-600 dark:text-red-400`}
              >
                <AlertTriangle className="h-5 w-5" />
                <span>{fetchError}</span>
              </div>
            ) : newsData && newsData.news.length > 0 ? (
              <div>
                {/* 新闻列表: 调整响应式内边距和字体大小 */}
                <ul
                  className={`list-disc pl-5 sm:pl-6 space-y-3 text-sm md:text-base ${themeColors.textColorSecondary}`}
                >
                  {" "}
                  {/* 修改: pl-6 -> pl-5 sm:pl-6 */}
                  {newsData.news.map((item, index) => (
                    <li key={index} className="break-words">
                      {item}
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
          <StudentInterestsSection />

          {/* 主要研究项目板块 (提取到独立组件) */}
          <MainProjectsSection />

          {/* 过往项目板块 (提取到独立组件) */}
          <FormerProjectsSection />

          {/* 教学板块 (提取到独立组件) */}
          <TeachingSection />

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
