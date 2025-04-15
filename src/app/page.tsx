import React from 'react';
import HeroSection from '@/components/HeroSection';
import ContentSection from '@/components/ContentSection';
import { themeColors } from '@/styles/theme';
import { AlertTriangle, Loader } from 'lucide-react'; // 引入图标用于状态反馈

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

  // 尝试获取新闻数据 (此部分代码保持不变)
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/news`;
    const res = await fetch(apiUrl, { cache: 'no-store' });
    isLoading = false;
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.title === 'string' && Array.isArray(data.news)) {
        newsData = data as NewsApiResponse;
      } else {
        console.error('从 API 收到的新闻数据格式无效:', data);
        fetchError = 'Failed to load news: Invalid data format.';
      }
    } else {
      console.error(`获取新闻失败: ${res.status} ${res.statusText}`);
      fetchError = `Failed to load news: Server error (${res.status}).`;
    }
  } catch (error: any) {
    isLoading = false;
    console.error('获取新闻数据时出错:', error);
    fetchError = `Failed to load news: Network or request error (${error.message || 'Unknown error'}).`;
  }

  // 招聘信息文本（通常是静态内容）
  const recruitmentText = "We always look for self-motivated under/graduate students who are ready to take on ambitious challenges to join my research group (with financial support).";

  return (
    // 使用 main 标签包裹页面主要内容，flex 布局使其内容垂直排列
    <main className="flex flex-col items-center">
      {/* 页面顶部的英雄区域组件 */}
      <HeroSection />

      {/* 主要内容区域容器: 设置更宽的最大宽度(max-w-7xl)，响应式内外边距，基础文字颜色 */}
      <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 ${themeColors.textColorPrimary}`}>
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
            <p className={`mb-6 text-base leading-relaxed ${themeColors.textColorSecondary}`}>
              We always look for <strong>self-motivated</strong> under/graduate students who are ready to take on ambitious challenges to join my research group (with <strong>financial support</strong>).
            </p>

            {/* 分隔线 */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

            {/* 新闻内容的条件渲染区域 (保持不变) */}
            {isLoading ? (
              <div className={`flex items-center space-x-2 ${themeColors.textColorSecondary}`}>
                <Loader className="animate-spin h-5 w-5" />
                <span>Loading news...</span>
              </div>
            ) : fetchError ? (
              <div className={`flex items-center space-x-2 text-red-600 dark:text-red-400`}>
                 <AlertTriangle className="h-5 w-5" />
                 <span>{fetchError}</span>
              </div>
            ) : newsData && newsData.news.length > 0 ? (
              <div>
                {/* 新闻列表: 调整响应式内边距和字体大小 */}
                <ul className={`list-disc pl-5 sm:pl-6 space-y-3 text-sm md:text-base ${themeColors.textColorSecondary}`}> {/* 修改: pl-6 -> pl-5 sm:pl-6 */}
                  {newsData.news.map((item, index) => (
                    <li key={index} className="break-words">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className={`${themeColors.textColorSecondary} text-sm md:text-base`}>No recent news available.</p> // 确保空状态文字大小也响应式
            )}
          </ContentSection>

          {/* 学生兴趣 (Students with Interests) 板块 */}
          <ContentSection id="interests" title="Students with Interests">
            {/* 描述段落: 确认基础文字大小和行高 */}
            <p className={`mb-4 text-base leading-relaxed ${themeColors.textColorSecondary}`}>
              If you are interested in AI and Big Data System, and good at two or more of the following skills, we shall definitely meet and talk. (If you are a undergraduate, one is sufficient)
            </p>
            {/* 技能列表: 调整响应式内边距和字体大小 */}
            <ul className={`list-disc pl-5 sm:pl-6 space-y-3 text-sm md:text-base ${themeColors.textColorSecondary}`}> {/* 修改: pl-6 -> pl-5 sm:pl-6 */}
              <li>Decent programming skills (C, C++, Python, Rust, etc.)</li>
              <li>Data Management Programming or Kernel Optimization (SQL, CQL, NewSQL, PostgreSQL, Cassandra, Redis, Zookeeper, Docker, etc.)</li>
              <li>Hardware hands-on experience (Verilog/VHDL/Chisel, HLS C/C++/OpenCL, CUDA, OpenCL)</li>
              <li>Hardware simulators and modeling (gem5, gpgpu-sim, Multi2Sim, etc.)</li>
              <li>Modeling and machine learning (Matlab, PyTorch, TF, Keras)</li>
            </ul>
            {/* 联系信息段落: 确认基础文字大小和行高 */}
            <p className={`mt-6 text-base leading-relaxed ${themeColors.textColorSecondary}`}>
              For more information, please feel free to contact me using the email address on my page.
            </p>
          </ContentSection>

          {/* 主要研究项目 (Main Focus Projects) 板块 */}
          <ContentSection id="main-projects" title="Main Focus Projects">
            {/* 项目之间的间距 */}
            <div className="space-y-10 md:space-y-12">
              {/* 第一个项目 */}
              <div>
                {/* 子标题: 确认响应式字体大小 */}
                <h3 className={`text-lg md:text-xl font-semibold mb-3 ${themeColors.textColorPrimary}`}>Open Sourced LLM Model Optimization</h3>
                {/* 项目描述: 确认响应式字体大小和行高 */}
                <p className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary}`}>
                  We are interested in optimizing the runtime of any open-sourced language models, Large or Small. We believe the memory wall and energy issue still exists, as well as the scalability, in the modern open sourced AI models. The two approach to make the model better are (1) a deduplicated, and well-coded underlying memory management; (2) a better scheduling to ensure the balancing between the LM nodes. Meanwhile, it is worthwhile to explore the means of building such systems in a small scale, on the edge, as well as protected. This raises our interests on how data driven approach applies to such system optimization design.
                </p>
              </div>
              {/* 其他项目保持类似结构和样式 */}
               <div>
                <h3 className={`text-lg md:text-xl font-semibold mb-3 ${themeColors.textColorPrimary}`}>Database Optimization and Correctness</h3>
                <p className={`text-sm md:text-base leading-relaxed mb-4 ${themeColors.textColorSecondary}`}>
                  We are interested in novel database design on new hardware. We believe the storage as well as the processing are both the bottleneck of the database services. We are calling help from novel processing chips, like GPU and DCU, and new memory architecture, such as phase change memory, to integrate with a database design. As such, we are working towards building up fast databases with a broader view of underlying systems.
                </p>
                <p className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary}`}>
                  Making a correct database is hard. No one can guarantee that a database is correct all the time since it selects different execution paths even for the same query. We would like to further explore how we can guarantee the correctness of a database building, processing, and outputing. Furthermore, we would like to know that what we do is correct as well. For this, we introduce database test with fuzzors. Based on a fuzzy algebra, we can produce mutant samples of testing and verification for novel systems as well as the AI platform.
                </p>
              </div>
              <div>
                <h3 className={`text-lg md:text-xl font-semibold mb-3 ${themeColors.textColorPrimary}`}>An Elastic Consistency System</h3>
                <p className={`text-sm md:text-base leading-relaxed mb-4 ${themeColors.textColorSecondary}`}>
                  We are trying to extend the original raft into the practical scenarios. That is providing scalable and cheap distributed services within the Raft protocol. The main contribution of this research is to extending the scope of a strong consensus algorithm into a very unreliable platform and make it work statistically in practice.
                </p>
                <p className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary}`}>
                  Here we promote our eRaft. eRaft is a high-performance C++ Raft library. This project is mainly developed by graduates from our GOOD lab. The Raft algorithm shall be accredited to Dr. Diego Ongaro. At present, our project has been included in the official distribution. We hope to explore the possibility of optimizing the existing algorithms on the basis of realizing a stable practical Raft library. If you are interested, please join us. Anyone interested may refer project. {/* 考虑稍后在此处添加链接 */}
                </p>
              </div>
            </div>
          </ContentSection>

          {/* 过往项目 (Former Projects) 板块 */}
          <ContentSection id="former-projects" title="Former Projects">
            <div className="space-y-10 md:space-y-12">
              {/* 第一个过往项目 */}
              <div>
                {/* 子标题: 确认响应式字体大小 */}
                <h3 className={`text-lg md:text-xl font-semibold mb-3 ${themeColors.textColorPrimary}`}>Ocean Database with Tempro-spatial Features</h3>
                {/* 项目描述: 确认响应式字体大小和行高 */}
                <p className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary}`}>
                  We are interested in ocean data, which by no means are large, versatile, and unpredictable. For this, we are going to build a database for ocean data, in order to serve applications, such as weather forecast, current prediction, etc. This is uniquely interesting because there are so many things in the sea that we have little knowledge about. As such, we tend to build the knowledge on top of this and forward a underlying database to serve fast queries, SQL and newSQL, to better improve the work.
                </p>
              </div>
              {/* 第二个过往项目 */}
              <div>
                <h3 className={`text-lg md:text-xl font-semibold mb-3 ${themeColors.textColorPrimary}`}>System Optimizations with Multiple Objectives</h3>
                <p className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary}`}>
                  We are trying to optimize all data services with metrics that are interesting, including but not limited to performance, throughput, energy, carbon, etc. Modeling and representation can help us better understand the world, as well as the data itself is a mimic of our on-going life. For a database system, we would like to shape it in a better way.
                </p>
              </div>
            </div>
          </ContentSection>

          {/* 教学 (Teaching) 板块 */}
          <ContentSection id="teaching" title="Teaching">
            {/* 课程列表: 调整响应式内边距和字体大小 */}
            <ul className={`list-disc pl-5 sm:pl-6 space-y-3 text-sm md:text-base ${themeColors.textColorSecondary}`}> {/* 修改: pl-6 -> pl-5 sm:pl-6 */}
              {/* 教学列表内容保持不变 */}
              <li>Introduction to Artificial Intelligence (Fall 2024, Fall 2023, Fall 2022, Spring 2021, 2020)</li>
              <li>Discrete Mathematics (Fall 2024, Fall 2023, Fall 2022, Spring 2021, 2020)</li>
              <li>Operating Systems (Fall 2019)</li>
              <li>Cloud Computing (Spring 2019)</li>
              <li>Introduction to Cloud Computing (Fall 2018)</li>
              <li>Network Protocol Analysis (Fall 2018)</li>
              <li>Aritificial Intelligent Computing Systems (Fall 2023, Fall 2022, Spring 2021, Spring 2019, Summer 2018)</li>
              <li>Linux Programming (Spring 2018)</li>
              <li>Data Structure (Fall 2017)</li>
              <li>Graduate Course Introduction to Combinatorics (Fall 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017)</li>
            </ul>
          </ContentSection>

          {/* 用于导航的占位符区域: 添加响应式 scroll-margin-top */}
          <section id="professor" className="scroll-mt-16 md:scroll-mt-20"></section>
          <section id="members" className="scroll-mt-16 md:scroll-mt-20"></section>
          <section id="contact" className="scroll-mt-16 md:scroll-mt-20"></section>
          <section id="blog" className="scroll-mt-16 md:scroll-mt-20"></section>

        </div> {/* 主要内容 flex 容器结束 */}
      </div> {/* 内容包装器 div 结束 */}
    </main>
  );
}